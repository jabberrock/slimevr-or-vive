import { useEffect, useRef, useState } from "react";

type OverlayVideoPlayerProps = {
    base_url: string
    overlay_url: string
    initial_opacity: number
    mask: string
};

function hexToRgb(hex: string) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function OverlayVideoPlayer({
    base_url,
    overlay_url,
    initial_opacity,
    mask
}: OverlayVideoPlayerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const baseRef = useRef<HTMLVideoElement | null>(null);
    const overlayRef = useRef<HTMLVideoElement | null>(null);
    const opacityRef = useRef(initial_opacity); // <— use ref, not state
    const [opacity, setOpacity] = useState(initial_opacity);

    useEffect(() => {
        opacityRef.current = opacity;
    }, [opacity]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const baseVid = baseRef.current;
        const overlayVid = overlayRef.current;
        if (!canvas || !baseVid || !overlayVid) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const key = hexToRgb(mask);
        const threshold = 100;
        const softness = 100;

        let rafId: number;
        let bothReady = false;

        const checkReadyAndStart = () => {
            if (
                baseVid.readyState >= 2 &&
                overlayVid.readyState >= 2 &&
                !bothReady
            ) {
                bothReady = true;
                baseVid.play().catch(() => { });
                overlayVid.play().catch(() => { });
                render();
            }
        };

        const render = () => {
            if (!bothReady) {
                rafId = requestAnimationFrame(render);
                return;
            }

            const w = baseVid.videoWidth;
            const h = baseVid.videoHeight;
            if (w === 0 || h === 0) {
                rafId = requestAnimationFrame(render);
                return;
            }

            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }

            ctx.drawImage(baseVid, 0, 0, w, h);

            const temp = document.createElement("canvas");
            temp.width = w;
            temp.height = h;
            const tctx = temp.getContext("2d");
            if (!tctx) return;

            tctx.drawImage(overlayVid, 0, 0, w, h);

            const frame = tctx.getImageData(0, 0, w, h);
            const data = frame.data;

            for (let i = 0; i < data.length; i += 4) {
                const dr = data[i] - key.r;
                const dg = data[i + 1] - key.g;
                const db = data[i + 2] - key.b;
                const dist = Math.sqrt(dr * dr + dg * dg + db * db);

                if (dist < threshold) {
                    data[i + 3] = 0;
                } else if (dist < threshold + softness) {
                    const t = (dist - threshold) / softness;
                    data[i + 3] = Math.round(data[i + 3] * t * opacityRef.current);

                    // Despill: reduce green so edges don’t glow
                    const avg = (data[i] + data[i + 2]) / 2;
                    data[i + 1] = Math.min(data[i + 1], avg);
                } else {
                    data[i + 3] = Math.round(data[i + 3] * opacityRef.current);
                }
            }

            tctx.putImageData(frame, 0, 0);
            ctx.drawImage(temp, 0, 0);

            rafId = requestAnimationFrame(render);
        };

        baseVid.addEventListener("loadeddata", checkReadyAndStart);
        overlayVid.addEventListener("loadeddata", checkReadyAndStart);

        return () => {
            cancelAnimationFrame(rafId);
            baseVid.removeEventListener("loadeddata", checkReadyAndStart);
            overlayVid.removeEventListener("loadeddata", checkReadyAndStart);
        };
    }, [mask]); // only rebuild loop if mask color changes

    return (
        <div>
            <canvas ref={canvasRef} style={{ maxWidth: "100%", background: "#000" }} />
            <video
                ref={baseRef}
                src={base_url}
                crossOrigin="anonymous"
                style={{ display: "none" }}
                loop
                muted
            />
            <video
                ref={overlayRef}
                src={overlay_url}
                crossOrigin="anonymous"
                style={{ display: "none" }}
                loop
                muted
            />
            <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
            />
        </div>
    );
}
