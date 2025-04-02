"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Video } from '@/lib/data'
import { cn } from '@/lib/utils'

interface RelatedVideosProps {
  currentVideo: Video
  allVideos: Video[]
}

const RelatedVideos: React.FC<RelatedVideosProps> = ({ currentVideo, allVideos }) => {
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Get the next 11 videos in sequence based on currentVideo's position
  const getNextSequentialVideos = () => {
    const currentIndex = allVideos.findIndex(v => String(v.id) === String(currentVideo.id))
    if (currentIndex === -1) return []
    
    return allVideos.slice(currentIndex + 1, currentIndex + 12)
  }

  const nextVideos = getNextSequentialVideos()

  useEffect(() => {
    setMounted(true)
    setIsDarkMode(resolvedTheme === 'dark')
  }, [resolvedTheme])

  const handleVideoClick = (videoId: string | number) => {
    router.push(`/video/${videoId}`)
  }

  // Format duration for display (if available)
  const formatDuration = (duration: string | undefined) => {
    if (!duration) return null
    return duration
  }

  // Base classes that don't depend on theme
  const getBaseClasses = (index: number) => {
    return cn(
      "group relative overflow-hidden rounded-lg cursor-pointer",
      "transition-transform duration-300 hover:scale-[1.02]",
      index === 0 && "ring-2 ring-offset-2",
      index === 0 && "ring-primary/30 ring-offset-background"
    )
  }

  const getPcBaseClasses = (index: number) => {
    return cn(
      "group flex gap-2 cursor-pointer rounded-md",
      "transition-all duration-300 hover:bg-accent/50 p-2",
      index === 0 && "ring-1 ring-offset-1",
      index === 0 && "ring-primary/30 ring-offset-background"
    )
  }

  // Theme-dependent classes that will be applied after mount
  const getThemeClasses = (index: number) => {
    if (!mounted) return ""
    
    return cn(
      index === 0 && isDarkMode ? "ring-primary/50" : "ring-primary/30",
      index === 0 && isDarkMode ? "glow-primary-dark" : index === 0 ? "glow-primary-light" : ""
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Related Videos</h2>
      
      {/* Mobile/Tablet Layout (default) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {nextVideos.map((video, index) => (
          <div
            key={String(video.id)}
            onClick={() => handleVideoClick(video.id)}
            className={cn(getBaseClasses(index), getThemeClasses(index))}
          >
            <div className="relative aspect-video">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="h-full w-full object-cover"
              />
              {index === 0 && (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    "bg-black/30 backdrop-blur-[2px] transition-all duration-300",
                    "group-hover:bg-black/40",
                    mounted && (isDarkMode ? "dark-next-overlay" : "light-next-overlay")
                  )}
                >
                  <span
                    className={cn(
                      "text-lg font-semibold text-white",
                      "transform transition-transform duration-300",
                      "group-hover:scale-105",
                      mounted && isDarkMode && "dark-next-text"
                    )}
                  >
                    Next Video
                  </span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <h3 className="line-clamp-2 text-sm font-medium">
                {video.title}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>{typeof video.views === 'number' ? video.views.toLocaleString() : video.views} views</span>
                <span className="mx-1">•</span>
                <span>{video.uploadDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* PC Layout (YouTube-style) */}
      <div className="hidden lg:grid gap-3">
        {nextVideos.map((video, index) => (
          <div
            key={String(video.id)}
            onClick={() => handleVideoClick(video.id)}
            className={cn(getPcBaseClasses(index), getThemeClasses(index))}
          >
            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-40 aspect-video">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="h-full w-full object-cover rounded-md"
              />
              {index === 0 && (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-md",
                    "bg-black/30 backdrop-blur-[2px] transition-all duration-300",
                    "group-hover:bg-black/40",
                    mounted && (isDarkMode ? "dark-next-overlay" : "light-next-overlay")
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold text-white",
                      "transform transition-transform duration-300",
                      "group-hover:scale-105",
                      mounted && isDarkMode && "dark-next-text"
                    )}
                  >
                    Next Video
                  </span>
                </div>
              )}
              {/* Video duration overlay */}
              {video.duration && (
                <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
                  {formatDuration(video.duration)}
                </div>
              )}
            </div>
            
            {/* Video Info */}
            <div className="flex flex-col justify-between flex-grow min-w-0">
              <h3 className="line-clamp-2 text-sm font-medium">
                {video.title}
              </h3>
              <div className="text-xs text-muted-foreground">
                <p>{video.uploader}</p>
                <p>{video.uploadDate}</p>
                <p>{typeof video.views === 'number' ? video.views.toLocaleString() : video.views} views</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RelatedVideos
