"use client"

import { useState, useEffect, useRef } from "react"
import { Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useInView } from "react-intersection-observer"

interface Video {
  id: string
  title: string
  thumbnail: string
  url: string
  views: number
  uploader: string
  uploadDate: string
  description: string
  platform: string
  category: string
  likes: number
  comments: number
}

// Better blur data URL generator with gray/blue tint (not green)
const generateBlurDataURL = () => {
  // This is a non-green base64 tiny placeholder
  return `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABQMEBAQDBQQEBAUFBQYHDAgHBwcHDwsLCQwRDxISEQ8RERMWHBcTFBoVEREYIRgaHR0fHx8TFyIkIh4kHB4fHv/bAEMBBQUFBwYHDggIDh4UERQeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHv/AABEIAAoAEAMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAGB//EACQQAAEDAwIHAAAAAAAAAAAAAAECAwQABREGEgcTISIxQWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAE/8QAGhEAAgIDAAAAAAAAAAAAAAAAAQIAAxESIf/aAAwDAQACEQMRAD8AqjThqoNpUOdqSUy7juxEjq6Z9noK0b9b1XfTcyI2sIddZUhCj4BJABPvGaqOJlpbt+sEyEM8qSgKcwMDdnBz+VYdnLu2PiLAnmK5iW2xzCM9hjp+UyGdLoWgbjR9rf/Z`
}

export default function VideoPlayer({ video }: { video: Video }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [blurAmount, setBlurAmount] = useState(20)
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  
  // Detect when player enters viewport
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  })

  const playerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const blurIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerRef.current?.requestFullscreen) {
        playerRef.current.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Preload thumbnail image
  useEffect(() => {
    if (video?.thumbnail) {
      const img = new window.Image()
      img.src = video.thumbnail
      img.onload = () => {
        setThumbnailLoaded(true)
      }
    }
  }, [video?.thumbnail])

  // Progressive blur reduction effect
  useEffect(() => {
    // Clear any existing interval
    if (blurIntervalRef.current) {
      clearInterval(blurIntervalRef.current)
    }
    
    if (thumbnailLoaded) {
      let currentBlur = 20
      blurIntervalRef.current = setInterval(() => {
        if (currentBlur > 0) {
          currentBlur = Math.max(0, currentBlur - 2)
          setBlurAmount(currentBlur)
        } else {
          if (blurIntervalRef.current) {
            clearInterval(blurIntervalRef.current)
          }
        }
      }, 40)
    }

    return () => {
      if (blurIntervalRef.current) {
        clearInterval(blurIntervalRef.current)
      }
    }
  }, [thumbnailLoaded])

  // Reset state when video changes
  useEffect(() => {
    setIsLoading(true)
    setThumbnailLoaded(false)
    setBlurAmount(20)
    setShowPlaceholder(true)
  }, [video.id])

  // Add intersection observer ref to the player ref
  const setRefs = (element: HTMLDivElement | null) => {
    playerRef.current = element
    inViewRef(element)
  }

  return (
    <div 
      ref={setRefs}
      className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden"
    >
      {/* Blur placeholder - ALWAYS shown initially */}
      <div 
        className="absolute inset-0 bg-gray-800 transition-opacity duration-300"
        style={{ 
          opacity: showPlaceholder ? 1 : 0,
          zIndex: 1
        }}
      >
        <div className="w-full h-full"
          style={{
            background: "linear-gradient(145deg, #1e293b, #334155)",
            filter: "blur(8px)"
          }}
        />
      </div>

      {/* Thumbnail with blur effect */}
      <div 
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{ 
          willChange: 'filter',
          filter: `blur(${blurAmount}px)`,
          transform: `scale(${1 + (blurAmount * 0.01)})`,
          opacity: thumbnailLoaded ? 1 : 0,
          zIndex: 2
        }}
      >
        <Image
          src={video.thumbnail || ''}
          alt={video.title}
          fill
          priority
          sizes="100vw"
          quality={85}
          fetchPriority="high"
          loading="eager"
          placeholder="blur"
          blurDataURL={generateBlurDataURL()}
          onLoadingComplete={() => {
            setThumbnailLoaded(true);
            // Set a timeout to hide the placeholder after thumbnail is loaded
            setTimeout(() => setShowPlaceholder(false), 100);
          }}
          className="object-cover"
          style={{
            opacity: thumbnailLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease'
          }}
        />
      </div>

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Video iframe */}
      {inView && video.url && (
        <iframe
          ref={iframeRef}
          src={video.url}
          className="absolute inset-0 w-full h-full z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
          style={{ 
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.5s ease'
          }}
          loading="eager"
        />
      )}

      {/* Fullscreen button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 h-9 w-9 text-white hover:bg-white/20 z-30"
      >
        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
      </Button>
    </div>
  )
}