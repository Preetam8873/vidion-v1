"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import VideoCard from "@/components/video-card"
import { Video } from "@/lib/data"
import { useInView } from 'react-intersection-observer'

interface VideoGridProps {
  videos: Video[]
  isLoading?: boolean
  batchSize?: number
}

const VideoGrid: React.FC<VideoGridProps> = ({ 
  videos, 
  isLoading = false,
  batchSize = 20 
}) => {
  const [visibleVideos, setVisibleVideos] = useState<Video[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadingRef = useRef<HTMLDivElement>(null)
  const preloadRef = useRef<HTMLDivElement>(null)
  const videoCache = useRef<Map<string, string>>(new Map())

  // Initialize visible videos
  useEffect(() => {
    setVisibleVideos(videos.slice(0, batchSize))
    setHasMore(videos.length > batchSize)
    setPage(1)
    // Clear cache when videos change (e.g., during search)
    videoCache.current.clear()
  }, [videos, batchSize])

  // Intersection Observer for infinite scroll
  const { ref: observerRef, inView } = useInView({
    threshold: 0,
    rootMargin: '500px 0px',
  })

  // Preload next batch of videos
  const preloadNextBatch = useCallback(() => {
    const nextStart = page * batchSize
    const nextEnd = nextStart + batchSize
    const nextBatch = videos.slice(nextStart, nextEnd)

    // Preload thumbnails
    nextBatch.forEach(video => {
      if (!videoCache.current.has(video.id.toString())) {
        const img = new Image()
        img.src = video.thumbnail
        videoCache.current.set(video.id.toString(), video.thumbnail)
      }
    })
  }, [videos, page, batchSize])

  // Handle loading more videos
  const loadMoreVideos = useCallback(() => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const nextPage = page + 1
    const start = 0
    const end = nextPage * batchSize

    // Simulate API call with timeout
    setTimeout(() => {
      const newVideos = videos.slice(start, end)
      setVisibleVideos(newVideos)
      setPage(nextPage)
      setHasMore(end < videos.length)
      setIsLoadingMore(false)
      
      // Preload next batch after current batch is loaded
      preloadNextBatch()
    }, 500)
  }, [page, videos, hasMore, isLoadingMore, batchSize, preloadNextBatch])

  // Load more videos when reaching the bottom
  useEffect(() => {
    if (inView) {
      loadMoreVideos()
    }
  }, [inView, loadMoreVideos])

  // Memoize the grid layout
  const gridLayout = useMemo(() => (
    <div 
      className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {visibleVideos.map((video, index) => (
        <div
          key={`${video.id}-${index}`}
          className="w-full transform transition-transform duration-300 hover:scale-105"
        >
          <VideoCard 
            video={video} 
            index={index} 
            cached={videoCache.current.has(video.id.toString())}
          />
        </div>
      ))}
    </div>
  ), [visibleVideos])

  // Loading skeleton
  const loadingSkeleton = useMemo(() => (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {[...Array(batchSize)].map((_, index) => (
        <div key={index} className="w-full animate-pulse">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ), [batchSize])

  if (isLoading) {
    return loadingSkeleton
  }

  if (!isLoading && (!videos || videos.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🎥</div>
        <h2 className="text-2xl font-bold mb-4">No videos available</h2>
        <p className="text-muted-foreground">Check back later for new content</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {gridLayout}
      
      {/* Loading indicator */}
      <div ref={observerRef} className="w-full">
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* End of content message */}
      {!hasMore && videos.length > batchSize && (
        <div className="text-center text-muted-foreground py-4">
          You've reached the end
        </div>
      )}
    </div>
  )
}

export default VideoGrid

