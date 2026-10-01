import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Room, RoomEvent, Track, type RemoteParticipant, type LocalParticipant } from 'livekit-client';
import AppLayout from '@/Layouts/AppLayout';
import type { Meeting, MeetingLivekit } from '@/types/meeting';

interface Props {
    meeting: Meeting & { creator?: { id: number; name: string } | null; course?: { id: number; code: string; name: string } | null };
    canManage: boolean;
    livekit: MeetingLivekit;
}

type ViewableParticipant = {
    identity: string;
    name: string;
    isLocal: boolean;
    videoTrack?: Track;
    audioTrack?: Track;
};

function ParticipantTile({ p }: { p: ViewableParticipant }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (p.videoTrack && videoRef.current) {
            p.videoTrack.attach(videoRef.current);
        }
        return () => {
            try {
                p.videoTrack?.detach();
            } catch {
                /* abaikan */
            }
        };
    }, [p.videoTrack]);

    useEffect(() => {
        if (p.audioTrack && audioRef.current) {
            p.audioTrack.attach(audioRef.current);
        }
        return () => {
            try {
                p.audioTrack?.detach();
            } catch {
                /* abaikan */
            }
        };
    }, [p.audioTrack]);

    return (
        <div className="relative overflow-hidden rounded-xl bg-slate-900">
            <video ref={videoRef} autoPlay playsInline muted={p.isLocal} className="h-48 w-full object-cover" />
            <audio ref={audioRef} autoPlay />
            {!p.videoTrack && (
                <div className="flex h-48 w-full items-center justify-center text-4xl text-white">
                    {p.name.charAt(0).toUpperCase()}
                </div>
            )}
            <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                {p.name} {p.isLocal ? '(kamu)' : ''}
            </span>
        </div>
    );
}

function collectParticipants(room: Room): ViewableParticipant[] {
    const out: ViewableParticipant[] = [];
    const lp: LocalParticipant = room.localParticipant;
    out.push({
        identity: lp.identity,
        name: lp.name || lp.identity,
        isLocal: true,
        videoTrack: Array.from(lp.videoTrackPublications.values())
            .map((pub) => pub.track)
            .find((t) => t?.kind === Track.Kind.Video) as Track | undefined,
        audioTrack: undefined, // local tidak perlu diputar balik
    });
    room.remoteParticipants.forEach((rp: RemoteParticipant) => {
        const video = Array.from(rp.videoTrackPublications.values())
            .map((pub) => pub.track)
            .find((t) => t && t.kind === Track.Kind.Video) as Track | undefined;
        const audio = Array.from(rp.audioTrackPublications.values())
            .map((pub) => pub.track)
            .find((t) => t && t.kind === Track.Kind.Audio) as Track | undefined;
        out.push({
            identity: rp.identity,
            name: rp.name || rp.identity,
            isLocal: false,
            videoTrack: video,
            audioTrack: audio,
        });
    });
    return out;
}

export default function RoomView({ meeting, canManage, livekit }: Props) {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
    const [error, setError] = useState('');
    const [participants, setParticipants] = useState<ViewableParticipant[]>([]);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [copied, setCopied] = useState(false);
    const [triedUrls, setTriedUrls] = useState<string[]>([]);
    const [attempt, setAttempt] = useState(0);
    const [turnDiag, setTurnDiag] = useState<{
        done: boolean;
        relayFound: boolean;
        candidates: string[];
        error: string;
    } | null>(null);
    const roomRef = useRef<Room | null>(null);

    // Diagnosa mandiri: kumpulkan kandidat ICE hanya via TURN server.
    // Kalau tidak ada kandidat "typ relay", browser tidak bisa memakai TURN
    // (TCP 3478 tidak sampai / auth ditolak) — info ini yang kami butuhkan.
    const runTurnDiag = async () => {
        if (!livekit.turn) {
            setTurnDiag({ done: true, relayFound: false, candidates: [], error: 'TURN tidak dikonfigurasi server' });
            return;
        }
        setTurnDiag(null);
        const found: string[] = [];
        let err = '';
        try {
            const pc = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: livekit.turn.urls,
                        username: livekit.turn.username,
                        credential: livekit.turn.credential,
                    },
                ],
            });
            pc.createDataChannel('diag');
            await new Promise<void>((resolve) => {
                const timer = setTimeout(resolve, 8000);
                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        found.push(e.candidate.candidate);
                    } else {
                        clearTimeout(timer);
                        resolve();
                    }
                };
                pc.onicegatheringstatechange = () => {
                    if (pc.iceGatheringState === 'complete') {
                        clearTimeout(timer);
                        resolve();
                    }
                };
                pc.createOffer()
                    .then((offer) => pc.setLocalDescription(offer))
                    .catch((e: unknown) => {
                        err = e instanceof Error ? e.message : 'gagal membuat offer';
                        clearTimeout(timer);
                        resolve();
                    });
            });
            pc.close();
        } catch (e) {
            err = e instanceof Error ? e.message : 'gagal diagnosa';
        }
        setTurnDiag({
            done: true,
            relayFound: found.some((c) => c.includes('typ relay')),
            candidates: found,
            error: err,
        });
    };

    // Kandidat URL signal: konfigurasi server dulu, lalu host yang sama dengan
    // halaman (penting bila app dibuka via LAN IP/WSL IP, bukan 127.0.0.1),
    // lalu varian wss bila halaman dibuka via https.
    const candidateUrls = (configured: string): string[] => {
        const out: string[] = [configured];
        try {
            const u = new URL(configured);
            const pageHost = window.location.hostname;
            const pageSecure = window.location.protocol === 'https:';
            const port = u.port || '7880';
            if (pageHost && pageHost !== u.hostname) {
                out.push(`${pageSecure ? 'wss:' : u.protocol}//${pageHost}:${port}`);
            }
            if (pageSecure && u.protocol === 'ws:') {
                out.push(`wss://${u.hostname}:${port}`);
                if (pageHost && pageHost !== u.hostname) {
                    out.push(`wss://${pageHost}:${port}`);
                }
            }
        } catch {
            /* abaikan */
        }
        return [...new Set(out)];
    };

    // Cek cepat: apakah port HTTP SFU bisa dijangkau browser?
    const httpReachable = async (wsUrl: string): Promise<boolean> => {
        try {
            const u = new URL(wsUrl);
            const httpProto = u.protocol === 'wss:' ? 'https:' : 'http:';
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 5000);
            await fetch(`${httpProto}//${u.hostname}:${u.port || '7880'}/`, {
                mode: 'no-cors',
                signal: ctrl.signal,
            });
            clearTimeout(t);
            return true;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        let disposed = false;
        // Catatan livekit-client v2: iceServers TIDAK dibaca dari konstruktor
        // Room, melainkan dari opsi room.connect({ rtcConfig }). Salah taruh =
        // diam-diam diabaikan (itulah yang terjadi sebelum perbaikan ini).
        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        const refresh = () => {
            if (!disposed) setParticipants(collectParticipants(room));
        };

        room
            .on(RoomEvent.TrackSubscribed, refresh)
            .on(RoomEvent.TrackUnsubscribed, refresh)
            .on(RoomEvent.ParticipantConnected, refresh)
            .on(RoomEvent.ParticipantDisconnected, refresh)
            .on(RoomEvent.LocalTrackPublished, refresh)
            .on(RoomEvent.LocalTrackUnpublished, refresh)
            .on(RoomEvent.Disconnected, () => {
                if (!disposed) setStatus((s) => (s === 'connected' ? 'connecting' : s));
            });

        (async () => {
            const urls = candidateUrls(livekit.wsUrl);
            if (!disposed) {
                setTriedUrls(urls);
                setStatus('connecting');
                setError('');
            }
            let lastErr = '';
            for (const url of urls) {
                if (disposed) return;
                const ok = await httpReachable(url);
                if (!ok) {
                    lastErr = `Tidak bisa menjangkau ${url} dari browser.`;
                    continue;
                }
                try {
                    // Paksa relay saat TURN tersedia: di jaringan ini UDP langsung
                    // dan hairpin NAT mati total, jadi kandidat host/srflx hanya
                    // membuang waktu. Relay TURN/TCP satu-satunya path yang hidup.
                    await room.connect(url, livekit.token, {
                        rtcConfig: livekit.turn
                            ? {
                                  iceServers: [
                                      {
                                          urls: livekit.turn.urls,
                                          username: livekit.turn.username,
                                          credential: livekit.turn.credential,
                                      },
                                  ],
                                  iceTransportPolicy: 'relay',
                              }
                            : undefined,
                    });
                    await room.localParticipant.setMicrophoneEnabled(true);
                    await room.localParticipant.setCameraEnabled(true);
                    if (!disposed) {
                        setStatus('connected');
                        refresh();
                    }
                    return;
                } catch (e) {
                    console.error(e, url);
                    lastErr = e instanceof Error ? `${url}: ${e.message}` : `${url}: gagal.`;
                }
            }
            if (!disposed) {
                setStatus('failed');
                setError(lastErr || 'Gagal terhubung ke LiveKit.');
            }
        })();

        return () => {
            disposed = true;
            room.disconnect();
            roomRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [livekit.wsUrl, livekit.token, attempt]);

    // Otomatis jalankan diagnosa TURN begitu koneksi dinyatakan gagal,
    // dan ulangi tiap percobaan baru.
    useEffect(() => {
        if (status === 'failed') {
            void runTurnDiag();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, attempt]);

    const toggleMic = async () => {
        const next = !micOn;
        setMicOn(next);
        try {
            await roomRef.current?.localParticipant.setMicrophoneEnabled(next);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleCam = async () => {
        const next = !camOn;
        setCamOn(next);
        try {
            await roomRef.current?.localParticipant.setCameraEnabled(next);
        } catch (e) {
            console.error(e);
        }
    };

    const leave = () => {
        try {
            roomRef.current?.disconnect();
        } finally {
            router.visit('/meetings');
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <AppLayout>
            <Link href="/meetings" className="text-sm text-indigo-700 hover:underline">
                ← Semua meeting
            </Link>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-slate-900 p-6 text-white">
                <div>
                    <p className="font-mono text-xs text-slate-400">
                        ROOM: {meeting.room_name} •{' '}
                        {meeting.course_id === null ? 'STANDALONE' : meeting.course?.code}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold">{meeting.title}</h1>
                    <p className="mt-1 text-sm text-slate-300">
                        {meeting.course?.name ?? 'Room bebas'} • {participants.length} di room • status:{' '}
                        {status === 'connected' ? 'terhubung' : status === 'failed' ? 'gagal' : 'menghubungkan…'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={copyLink}
                        className="rounded-lg bg-white/20 px-3 py-1 text-sm hover:bg-white/30"
                    >
                        {copied ? 'Link tersalin!' : 'Salin link'}
                    </button>
                    {canManage && (
                        <>
                            <Link
                                href={`/meetings/${meeting.id}/edit`}
                                className="rounded-lg bg-white/20 px-3 py-1 text-sm hover:bg-white/30"
                            >
                                Ubah
                            </Link>
                            <button
                                onClick={() => {
                                    if (confirm('Akhiri meeting untuk semua?'))
                                        router.post(`/meetings/${meeting.id}/end`);
                                }}
                                className="rounded-lg bg-red-500/80 px-3 py-1 text-sm hover:bg-red-500"
                            >
                                Akhiri
                            </button>
                        </>
                    )}
                </div>
            </div>

            {status === 'failed' && (
                <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-bold">Belum terhubung ke server video (LiveKit).</p>
                    <p className="mt-1">Error: {error || 'unknown'}</p>
                    <div className="mt-2">
                        <p className="font-medium">URL yang sudah dicoba dari browser kamu:</p>
                        <ul className="mt-1 list-disc pl-5 font-mono text-xs">
                            {triedUrls.map((u) => (
                                <li key={u}>{u}</li>
                            ))}
                        </ul>
                        <p className="mt-1 text-xs">
                            Relay TURN:{' '}
                            {livekit.turn ? (
                                <>
                                    aktif (<span className="font-mono">{livekit.turn.urls.join(', ')}</span>,
                                    kedaluwarsa{' '}
                                    {new Date(livekit.turn.expires_at).toLocaleTimeString('id-ID')})
                                </>
                            ) : (
                                'nonaktif (STUN default)'
                            )}
                        </p>
                    </div>
                    {/pc connection|ICE|DTLS/i.test(error) ? (
                        <p className="mt-2">
                            Sinyal (WebSocket) sudah tersambung, yang gagal adalah jalur{' '}
                            <b>media WebRTC</b> — biasanya UDP diblokir firewall/VPN atau NAT tidak
                            mendukung hairpin. Coba: matikan VPN/ad-blocker, gunakan jaringan lain,
                            atau pastikan relay TURN di atas berstatus aktif. Token untuk room{' '}
                            <code className="font-mono">{livekit.room}</code> masih valid.
                        </p>
                    ) : (
                        <p className="mt-2">
                            Browser kamu tidak bisa menjangkau SFU. Pastikan SFU jalan{' '}
                            <code className="font-mono">docker compose --profile webrtc up -d</code>{' '}
                            (atau <code className="font-mono">livekit-server --config livekit.yaml</code>),
                            lalu buka versi HTTP-nya di tab baru (mis.{' '}
                            <code className="font-mono">http://HOST:7880</code> dengan HOST yang sama seperti
                            di address bar — harus tampil teks <code className="font-mono">OK</code>).
                            Token untuk room <code className="font-mono">{livekit.room}</code> sudah valid,
                            jadi halaman ini akan hijau otomatis begitu SFU terjangkau.
                        </p>
                    )}
                    <button
                        onClick={() => setAttempt((a) => a + 1)}
                        className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                    >
                        Coba Hubungkan Lagi
                    </button>
                    <div className="mt-3 rounded-lg bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">Diagnosa TURN otomatis</p>
                            <button
                                onClick={() => void runTurnDiag()}
                                className="rounded border px-2 py-1 text-xs hover:bg-slate-100"
                            >
                                Jalankan ulang
                            </button>
                        </div>
                        {!turnDiag && <p className="mt-1 text-xs">Mengetes relay TURN dari browser…</p>}
                        {turnDiag?.error && <p className="mt-1 text-xs text-red-600">{turnDiag.error}</p>}
                        {turnDiag?.done && !turnDiag.error && (
                            <>
                                <p className="mt-1 text-xs">
                                    Kandidat relay (TURN):{' '}
                                    <b className={turnDiag.relayFound ? 'text-emerald-700' : 'text-red-600'}>
                                        {turnDiag.relayFound
                                            ? 'DITEMUKAN — browser bisa memakai relay'
                                            : 'TIDAK DITEMUKAN — browser tidak mencapai TURN'}
                                    </b>
                                </p>
                                {turnDiag.candidates.length > 0 && (
                                    <ul className="mt-1 max-h-24 list-disc overflow-auto pl-5 font-mono text-[11px]">
                                        {turnDiag.candidates.map((c, i) => (
                                            <li key={i}>{c}</li>
                                        ))}
                                    </ul>
                                )}
                                {turnDiag.candidates.length === 0 && (
                                    <p className="mt-1 text-xs">
                                        Tidak ada kandidat sama sekali — koneksi ke{' '}
                                        <span className="font-mono">{livekit.turn?.urls.join(', ')}</span>{' '}
                                        terblokir di jaringan/forwarding port.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {participants.map((p) => (
                    <ParticipantTile key={p.identity} p={p} />
                ))}
            </div>
            {status === 'connecting' && participants.length === 0 && (
                <p className="mt-4 rounded-xl bg-white p-6 text-center text-sm text-slate-500">
                    Menghubungkan ke room <span className="font-mono">{livekit.room}</span>…
                    Izinkan akses kamera &amp; mic saat browser meminta.
                </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    onClick={toggleMic}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${micOn ? 'bg-white hover:bg-slate-100' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                    {micOn ? 'Matikan Mic' : 'Nyalakan Mic'}
                </button>
                <button
                    onClick={toggleCam}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${camOn ? 'bg-white hover:bg-slate-100' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                    {camOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
                </button>
                <button
                    onClick={leave}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                    Keluar Room
                </button>
            </div>

            {meeting.description && (
                <p className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-600">{meeting.description}</p>
            )}
        </AppLayout>
    );
}
