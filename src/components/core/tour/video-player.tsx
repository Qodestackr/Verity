"use client"

import { useState, useRef } from "react"
import { Play, Pause, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VideoPlayerProps } from "./types"

export function VideoPlayer({
    src, className, poster }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    return (
        <div className={cn("relative rounded-lg overflow-hidden bg-black/5", className)}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            )}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full rounded-lg object-cover"
                onLoadedData={() => setIsLoading(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                playsInline
            />
            <button
                onClick={togglePlay}
                className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200",
                    isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100",
                )}
                aria-label={isPlaying ? "Pause video" : "Play video"}
            >
                {isPlaying ? (
                    <Pause className="w-16 h-16 text-white drop-shadow-lg" />
                ) : (
                    <Play className="w-16 h-16 text-white drop-shadow-lg" />
                )}
            </button>
        </div>
    )
}