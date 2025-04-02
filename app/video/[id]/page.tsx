"use client"

import { use } from "react"
import { videos, Video } from "@/lib/data"
import VideoPlayer from "@/components/video-player"
import VideoInfo from "@/components/video-info"
import RelatedVideos from "@/components/related-videos"
import { notFound } from "next/navigation"
import Header from "@/components/header"
import { useRouter } from "next/navigation"

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  // Find the video with the matching ID
  const video = videos.find(v => String(v.id) === resolvedParams.id)
  if (!video) {
    notFound()
  }

  // Get related videos (excluding current video)
  const relatedVideos = videos
    .filter(v => String(v.id) !== resolvedParams.id)
    .slice(0, 10) // Limit to 10 related videos

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      // Store the search query in localStorage before redirecting
      localStorage.setItem('searchQuery', query.trim())
      router.push(`/?search=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/')
    }
  }

  return (
    <>
      <Header onSearch={handleSearch} />
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VideoPlayer video={video} />
            <VideoInfo video={video} />
          </div>
          <div className="lg:col-span-1">
            <RelatedVideos currentVideo={video} videos={relatedVideos} />
          </div>
        </div>
      </main>
    </>
  )
}

