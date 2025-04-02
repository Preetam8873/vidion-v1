"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { Video } from "@/lib/data"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

const extractVideoNumber = (title: string): number | null => {
  // Enhanced regex to extract numbers from titles like "1. Introduction" or "01 Introduction"
  const match = title.match(/^(\d+)/)
  return match ? parseInt(match[1]) : null
}

const getSequentialVideos = (currentVideo: Video, allVideos: Video[]): Video[] => {
  if (!currentVideo || !allVideos?.length) return []
  
  // Always exclude the current video from recommendations
  const filteredVideos = allVideos.filter(video => video.id !== currentVideo.id)
  
  const currentNumber = extractVideoNumber(currentVideo.title)
  
  // If current video doesn't have a number, return the first 11 videos
  if (currentNumber === null) {
    return filteredVideos.slice(0, 11)
  }

  // Process all videos to extract numbers and sort them
  const numberedVideos = filteredVideos
    .map(video => ({
      video,
      number: extractVideoNumber(video.title)
    }))
    .filter(item => item.number !== null)
    .sort((a, b) => a.number! - b.number!)

  // Find the index of the current video number in the sorted list
  const currentIndex = numberedVideos.findIndex(item => item.number! > currentNumber)

  // If we found videos with higher numbers, take the next ones
  if (currentIndex >= 0) {
    return numberedVideos
      .slice(currentIndex, currentIndex + 11)
      .map(item => item.video)
  }

  // If no higher numbers found, return the first 11 videos
  return filteredVideos.slice(0, 11)
}

function NextVideoFrame({ video }: { video: Video }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`absolute inset-0 flex flex-col justify-end rounded-lg overflow-hidden ${
        isDark 
          ? 'border-2 border-rose-500/40 shadow-[0_0_25px_rgba(255,20,147,0.3)]' 
          : 'border-2 border-indigo-500/20 shadow-lg'
      }`}
    >
      <div className={`absolute inset-0 ${
        isDark 
          ? 'bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent' 
          : 'bg-gradient-to-t from-white via-white/90 to-transparent'
      }`}>
        {/* Pulsing "Next Video" badge */}
        <div className="absolute top-3 left-3 z-10">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: isDark 
                ? ['0 0 0 rgba(255,20,147,0.3)', '0 0 10px rgba(255,20,147,0.5)', '0 0 0 rgba(255,20,147,0.3)']
                : ['0 0 0 rgba(79,70,229,0.1)', '0 0 8px rgba(79,70,229,0.2)', '0 0 0 rgba(79,70,229,0.1)']
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isDark 
                ? 'bg-rose-500/20 text-rose-300' 
                : 'bg-indigo-500/10 text-indigo-700'
            }`}
          >
            Next Video
          </motion.div>
        </div>

        {/* Content with animated border */}
        <div className="p-4 relative h-full flex flex-col justify-end">
          {/* Animated left border */}
          <motion.div
            className="absolute left-0 top-0 h-full w-1"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.7, ease: "backOut" }}
            style={{
              background: isDark 
                ? 'linear-gradient(to bottom, #ff0076, #ff1493)' 
                : 'linear-gradient(to bottom, #4f46e5, #6366f1)',
              transformOrigin: 'top'
            }}
          />

          <div className="pl-3">
            <div className={`text-base font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {video.title}
            </div>
            <div className={`text-xs mt-1 ${
              isDark ? 'text-rose-200' : 'text-indigo-600'
            }`}>
              {video.views} views
            </div>
          </div>

          {/* Animated bottom border */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{
              background: isDark
                ? 'linear-gradient(to right, #ff0076, #ff1493)'
                : 'linear-gradient(to right, #4f46e5, #6366f1)'
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function RelatedVideoItem({ 
  video, 
  isMobile,
  isNextVideo
}: { 
  video: Video
  isMobile?: boolean
  isNextVideo?: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <Link href={`/video/${video.id}`} className="block">
        <Card className={`overflow-hidden transition-all duration-300 ${
          isHovered ? (isNextVideo ? 'shadow-lg' : 'shadow-md') : ''
        } ${
          isNextVideo ? (isDark ? 'border-rose-500/30' : 'border-indigo-500/20') : ''
        }`}>
          <CardContent className="p-0">
            <div className={`flex ${isMobile ? 'flex-col' : 'gap-2'}`}>
              <div className={`relative ${isMobile ? 'w-full aspect-video' : 'w-40 h-24'} bg-muted`}>
                <Image
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  fill
                  className={`object-cover transition-transform duration-300 ${
                    isHovered ? 'scale-105' : ''
                  } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  sizes={isMobile ? "(max-width: 768px) 100vw" : "160px"}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
                {isNextVideo && <NextVideoFrame video={video} />}
                {!isNextVideo && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                    {video.views} views
                  </div>
                )}
              </div>
              <div className="flex-1 p-2">
                <h4 className={`font-medium line-clamp-2 text-sm ${
                  isNextVideo ? (isDark ? 'text-rose-100' : 'text-indigo-700') : ''
                }`}>
                  {video.title}
                </h4>
                <p className={`text-xs mt-1 ${
                  isNextVideo ? (isDark ? 'text-rose-300/80' : 'text-indigo-600/80') : 'text-muted-foreground'
                }`}>
                  {video.uploader}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export default function RelatedVideos({ currentVideo, videos }: { currentVideo?: Video, videos: Video[] }) {
  const [sequentialVideos, setSequentialVideos] = useState<Video[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { theme } = useTheme()

  useEffect(() => {
    if (!currentVideo || !videos?.length) {
      // When no current video, show first few videos in numerical order
      if (videos?.length) {
        const sortedVideos = [...videos]
          .map(video => ({
            video,
            number: extractVideoNumber(video.title)
          }))
          .filter(item => item.number !== null)
          .sort((a, b) => (a.number || 0) - (b.number || 0))
          .map(item => item.video)
          .slice(0, 11)
        
        setSequentialVideos(sortedVideos)
      } else {
        setSequentialVideos([])
      }
      return
    }

    const nextVideos = getSequentialVideos(currentVideo, videos)
    setSequentialVideos(nextVideos)
  }, [currentVideo, videos])

  // Check if first video is numerically next in sequence
  const isDirectlyNextVideo = (currentVideo && sequentialVideos.length > 0) ? 
    extractVideoNumber(sequentialVideos[0]?.title || "") === (extractVideoNumber(currentVideo?.title || "") || 0) + 1 : false

  // Don't show section if no sequential videos found
  if (sequentialVideos.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className={`text-xl font-semibold ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>
        {isDirectlyNextVideo ? "Up Next" : "Related Videos"}
      </h2>
      <div className="space-y-3">
        {sequentialVideos.map((video, index) => (
          <RelatedVideoItem
            key={video.id}
            video={video}
            isMobile={isMobile}
            isNextVideo={index === 0 && isDirectlyNextVideo}
          />
        ))}
      </div>
    </div>
  )
}