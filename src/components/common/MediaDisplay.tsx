import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MediaDisplayProps {
    src: string;
    alt?: string;
    className?: string;
    containerClassName?: string;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    onHoverPlay?: boolean;
    isVideoHint?: boolean;
}

export function MediaDisplay({
    src,
    alt = "",
    className,
    containerClassName,
    autoPlay = true,
    loop = true,
    muted = true,
    controls = false,
    onHoverPlay = false,
    isVideoHint = false,
}: MediaDisplayProps) {
    const [isError, setIsError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Lazy-load: only render video/image when visible in viewport
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Improved detection logic
    const isVideoMedia = (url: string) => {
        if (isVideoHint) return true;
        if (!url) return false;
        if (url.match(/\.(mp4|webm|mov|ogg|m4v|3gp|mkv)$/i)) return true;
        if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('type=video')) return true;
        if (url.includes('/media/db/') && (url.toLowerCase().includes('video') || url.toLowerCase().includes('mp4'))) return true;
        return false;
    };

    const handleMouseOver = (e: React.MouseEvent<HTMLVideoElement>) => {
        if (onHoverPlay) {
            e.currentTarget.play().catch(() => { });
        }
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLVideoElement>) => {
        if (onHoverPlay) {
            e.currentTarget.pause();
        }
    };

    if (!src || isError) {
        return (
            <div className={cn("w-full h-full flex items-center justify-center bg-muted text-muted-foreground", containerClassName)}>
                <span className="text-[10px] opacity-40 uppercase tracking-tighter italic">Pas de média</span>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
            {!isVisible ? (
                <div className="w-full h-full bg-muted animate-pulse" />
            ) : isVideoMedia(src) ? (
                <video
                    src={src}
                    className={cn("w-full h-full object-cover", className)}
                    autoPlay={autoPlay && !onHoverPlay}
                    loop={loop}
                    muted={muted}
                    playsInline
                    controls={controls}
                    preload="auto"
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    onError={() => setIsError(true)}
                />
            ) : (
                <img
                    src={src}
                    alt={alt}
                    className={cn("w-full h-full object-cover", className)}
                    onError={() => setIsError(true)}
                    loading="lazy"
                    decoding="async"
                />
            )}
        </div>
    );
}
