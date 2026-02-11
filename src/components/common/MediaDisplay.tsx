import { useState } from "react";
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
}: MediaDisplayProps) {
    const [isError, setIsError] = useState(false);

    // Improved detection logic
    const isVideo = (url: string) => {
        if (!url) return false;

        // Check extension
        if (url.match(/\.(mp4|webm|mov|ogg|m4v|3gp|mkv)$/i)) return true;

        // Check for API hint/mime hints in URL (V11.0 enhancement)
        if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('type=video')) return true;

        // Check for "vid" or "video" in common binary paths if we know they are videos
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
        <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
            {isVideo(src) ? (
                <video
                    src={src}
                    className={cn("w-full h-full object-cover", className)}
                    autoPlay={autoPlay && !onHoverPlay}
                    loop={loop}
                    muted={muted}
                    playsInline
                    controls={controls}
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
                />
            )}
        </div>
    );
}
