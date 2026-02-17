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
    priority?: boolean;
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
    priority = false,
}: MediaDisplayProps) {
    const [isError, setIsError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Lazy-load: only render video/image when visible in viewport
    useEffect(() => {
        if (priority) {
            setIsVisible(true);
            return;
        }
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "400px",
                threshold: 0.01
            }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [priority]);

    // ... detection logic ...
    const isVideoMedia = (url: string) => {
        if (isVideoHint) return true;
        if (!url) return false;
        if (url.match(/\.(mp4|webm|mov|ogg|m4v|3gp|mkv)$/i)) return true;
        return false;
    };

    const handleMouseOver = (e: React.MouseEvent<HTMLVideoElement>) => {
        if (onHoverPlay) e.currentTarget.play().catch(() => { });
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLVideoElement>) => {
        if (onHoverPlay) e.currentTarget.pause();
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
            {(!isVisible && !priority) ? (
                <div className="w-full h-full bg-muted animate-pulse" />
            ) : isVideoMedia(src) ? (
                <video
                    src={src}
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-300",
                        isLoaded ? "opacity-100" : "opacity-0",
                        className
                    )}
                    autoPlay={autoPlay && !onHoverPlay}
                    loop={loop}
                    muted={muted}
                    playsInline
                    controls={controls}
                    preload={priority ? "auto" : "metadata"}
                    // @ts-ignore
                    fetchpriority={priority ? "high" : "auto"}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    onLoadedData={() => setIsLoaded(true)}
                    onError={() => setIsError(true)}
                    width="600"
                    height="800"
                />
            ) : (
                <img
                    src={src}
                    alt={alt}
                    className={cn(
                        "w-full h-full object-cover",
                        !priority && "transition-opacity duration-300",
                        isLoaded || priority ? "opacity-100" : "opacity-0",
                        className
                    )}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setIsError(true)}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    // @ts-ignore
                    fetchpriority={priority ? "high" : "auto"}
                    width="600"
                    height="800"
                />
            )}
        </div>
    );
}
