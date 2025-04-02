"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { videos } from "@/lib/data"
import { useRouter } from "next/navigation"

interface Notification {
  id: number
  title: string
  thumbnail: string
  timestamp: string
  isRead: boolean
  avatar: string
  channelName: string
}

// Function to generate random time strings
const getRandomTime = () => {
  const times = [
    "Just now",
    "45 seconds ago",
    "1 minute ago",
    "5 minutes ago",
    "2 hours ago",
    "1 day ago",
    "3 days ago",
    "1 week ago",
    "2 weeks ago",
    "1 month ago"
  ]
  return times[Math.floor(Math.random() * times.length)]
}

export function NotificationPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const popupRef = useRef<HTMLDivElement>(null)

  // Sort videos randomly and create notifications
  const getNotifications = useCallback((): Notification[] => {
    const shuffledVideos = [...videos]
      .sort(() => Math.random() - 0.5) // Shuffle videos
      .slice(0, 9) // Get 9 random videos
      .map(video => ({
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail,
        timestamp: getRandomTime(), // Use random time string
        isRead: false,
        avatar: "https://i.postimg.cc/R03LypvV/PXL-20230705-131447762-PORTRAIT.jpg",
        channelName: video.uploader
      }));

    // Sort notifications by timestamp (latest first)
    return shuffledVideos.sort((a, b) => {
      const timeA = a.timestamp === "Just now" ? 0 : parseInt(a.timestamp);
      const timeB = b.timestamp === "Just now" ? 0 : parseInt(b.timestamp);
      return timeB - timeA; // Sort in descending order
    });
  }, [])

  const [notifications, setNotifications] = useState<Notification[]>(getNotifications())
  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleVideoClick = useCallback((videoId: number) => {
    setIsOpen(false)
    router.push(`/video/${videoId}`)
  }, [router])

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop with blur and darkness */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
            onClick={() => setIsOpen(false)}
          />

          <Card ref={popupRef} className="
            absolute 
            right-0 
            top-12 
            w-[480px]
            max-h-[85vh] 
            overflow-y-auto 
            z-50
            backdrop-blur-sm 
            bg-white/[0.98]    
            dark:bg-gray-900/80
            border 
            border-border/40 
            shadow-2xl
            rounded-xl
            notification-scrollbar
            animate-in
            fade-in-0
            slide-in-from-top-5
            duration-150
          ">
            {/* Header */}
            <div className="sticky top-0 p-4 border-b border-border/40 bg-white dark:bg-gray-900/90">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Notifications</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                  }}
                >
                  Mark all as read
                </Button>
              </div>
            </div>

            <div className="divide-y divide-border/40">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 
                    bg-white/[0.98]
                    hover:bg-gray-50
                    dark:bg-gray-900/80
                    dark:hover:bg-gray-800/50
                    transition-all
                    duration-300
                    cursor-pointer
                    flex 
                    items-center 
                    gap-4
                    ${notification.isRead ? 'opacity-70' : 'opacity-100'}
                    group
                  `}
                  onClick={() => {
                    handleVideoClick(notification.id)
                    setNotifications(prev =>
                      prev.map(n =>
                        n.id === notification.id ? { ...n, isRead: true } : n
                      )
                    )
                  }}
                >
                  {/* Channel Avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={notification.avatar} alt={notification.channelName} />
                    <AvatarFallback>{notification.channelName.substring(0, 2)}</AvatarFallback>
                  </Avatar>

                  {/* Title and Channel Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {notification.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{notification.channelName}</span>
                      <span>•</span>
                      <span>{notification.timestamp}</span>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative h-20 w-32 flex-shrink-0 rounded-md overflow-hidden group/thumb">
                    <Image
                      src={notification.thumbnail}
                      alt=""
                      fill
                      className="object-cover transition-transform group-hover/thumb:scale-105 duration-300"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-0 h-0 border-t-6 border-t-transparent border-l-8 border-l-white border-b-6 border-b-transparent ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
