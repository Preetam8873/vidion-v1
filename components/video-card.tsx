"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Video } from '@/lib/data'

interface VideoCardProps {
  video: Video
  index: number
}

const VideoCard: React.FC<VideoCardProps> = ({ video, index }) => {
  const router = useRouter()

  const handleVideoClick = () => {
    router.push(`/video/${video.id}`)
  }

  return (
    <div 
      onClick={handleVideoClick}
      className="w-full cursor-pointer transform transition-transform duration-300 hover:scale-105"
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden rounded-lg">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Optional: Add video duration */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
            {video.duration}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="mt-2">
        <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {video.author}
        </p>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <span>{video.views.toLocaleString()} views</span>
          <span className="mx-1">•</span>
          <span>{video.uploadedAt}</span>
        </div>
      </div>
    </div>
  )
}

export default VideoCard