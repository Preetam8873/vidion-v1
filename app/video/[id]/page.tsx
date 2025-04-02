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
      <main className="max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 min-w-0 p-4 lg:p-6">
            <div className="max-w-[1400px] mx-auto">
              <VideoPlayer video={video} />
              <VideoInfo video={video} />
            </div>
          </div>
          <div className="w-full lg:w-[400px] xl:w-[480px] p-4 lg:py-6 lg:pr-6 lg:pl-0">
            <RelatedVideos currentVideo={video} allVideos={videos} />
          </div>
        </div>
      </main>
    </>
  )
}

