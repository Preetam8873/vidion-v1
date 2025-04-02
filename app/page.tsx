"use client"

import { useState, useEffect } from "react"
import VideoGrid from "@/components/video-grid"
import Header from "@/components/header"
import { Video, videos } from "@/lib/data"
import { shuffleArray } from "@/lib/utils"
import VideoCard from "@/components/video-card"
import { useRouter } from "next/navigation"

// Helper function to perform search
const fetchSearchResults = (query: string) => {
  return new Promise((resolve) => {
    // Filter videos locally based on title and description
    const results = videos.filter((video) => {
      const searchTerm = query.toLowerCase()
      return (
        video.title.toLowerCase().includes(searchTerm) ||
        video.description.toLowerCase().includes(searchTerm)
      )
    })
    resolve(results)
  })
}

export default function Home() {
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [displayedVideos, setDisplayedVideos] = useState<Video[]>([])
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Handle initial search from URL or localStorage
  useEffect(() => {
    const handleInitialSearch = async () => {
      try {
        // Check URL search params first
        const urlParams = new URLSearchParams(window.location.search)
        const searchParam = urlParams.get('search')
        
        // If no URL param, check localStorage
        const storedQuery = localStorage.getItem('searchQuery')
        
        const query = searchParam || storedQuery
        
        if (query) {
          setSearchQuery(query)
          setIsSearching(true)
          const results = videos.filter((video) => {
            const searchTerm = query.toLowerCase()
            return (
              video.title.toLowerCase().includes(searchTerm) ||
              video.description.toLowerCase().includes(searchTerm)
            )
          })
          setFilteredVideos(results)
          setDisplayedVideos(results.slice(0, 40))
          // Clear the stored query after using it
          localStorage.removeItem('searchQuery')
        } else {
          // If no search query, show random videos
          if (Array.isArray(videos) && videos.length > 0) {
            const shuffled = shuffleArray(videos)
            setFilteredVideos(shuffled)
            setDisplayedVideos(shuffled.slice(0, 40))
          }
        }
      } catch (error) {
        console.error('Initial search error:', error)
      } finally {
        setIsInitialLoading(false)
        setIsSearching(false)
      }
    }

    handleInitialSearch()
  }, [videos])

  // Shuffle videos on initial load if no search query
  useEffect(() => {
    if (Array.isArray(videos) && videos.length > 0 && !searchQuery) {
      const shuffled = shuffleArray(videos)
      setFilteredVideos(shuffled)
      setDisplayedVideos(shuffled.slice(0, 40))
      setIsInitialLoading(false)
    }
  }, [videos, searchQuery])

  const handleSearch = async (query: string) => {
    try {
      setIsSearching(true)
      setSearchQuery(query)

      if (!query.trim()) {
        // When search is cleared, show random videos again
        if (Array.isArray(videos) && videos.length > 0) {
          const shuffled = shuffleArray(videos)
          setFilteredVideos(shuffled)
          setDisplayedVideos(shuffled.slice(0, 40))
        }
        return
      }

      // Search logic
      const results = videos.filter((video) => {
        const searchTerm = query.toLowerCase()
        return (
          video.title.toLowerCase().includes(searchTerm) ||
          video.description.toLowerCase().includes(searchTerm)
        )
      })
      
      setFilteredVideos(results)
      setDisplayedVideos(results.slice(0, 40)) // Update displayed videos immediately
    } catch (error) {
      console.error('Search error:', error)
      if (Array.isArray(videos) && videos.length > 0) {
        const shuffled = shuffleArray(videos)
        setFilteredVideos(shuffled)
        setDisplayedVideos(shuffled.slice(0, 40))
      }
    } finally {
      setIsSearching(false)
    }
  }

  // Add scroll handler for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
        !isLoadingMore &&
        filteredVideos.length > displayedVideos.length
      ) {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        const start = page * 40;
        const end = nextPage * 40;
        const newVideos = filteredVideos.slice(start, end);
        setDisplayedVideos(prev => [...prev, ...newVideos]);
        setPage(nextPage);
        setIsLoadingMore(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, isLoadingMore, filteredVideos, displayedVideos]);

  return (
    <main className="min-h-screen">
      <Header 
        onSearch={handleSearch} 
        isHomePage={true} 
      />
      <section className="container mx-auto px-4 py-6 md:py-10">
        {isSearching ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <VideoGrid 
              videos={displayedVideos} 
              isLoading={isInitialLoading || isSearching}
            />
            {isLoadingMore && (
              <div className="flex justify-center items-center py-4">
                <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

