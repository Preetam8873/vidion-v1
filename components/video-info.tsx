"use client"

import { useState, useRef } from "react"
import { Share, ThumbsUp, ThumbsDown, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import ShareModal from "./share-modal"
import confetti from 'canvas-confetti'
import { Video } from "@/lib/data"

export default function VideoInfo({ video }: { video: Video }) {
  const [likes, setLikes] = useState(typeof video.likes === 'string' ? Number.parseInt(video.likes) || 0 : video.likes)
  const [dislikes, setDislikes] = useState(0)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const subscribeButtonRef = useRef<HTMLButtonElement>(null)

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1)
      setIsLiked(false)
    } else {
      setLikes(likes + 1)
      setIsLiked(true)

      if (isDisliked) {
        setDislikes(dislikes - 1)
        setIsDisliked(false)
      }
    }
  }

  const handleDislike = () => {
    if (isDisliked) {
      setDislikes(dislikes - 1)
      setIsDisliked(false)
    } else {
      setDislikes(dislikes + 1)
      setIsDisliked(true)

      if (isLiked) {
        setLikes(likes - 1)
        setIsLiked(false)
      }
    }
  }

  const handleShare = () => {
    setIsShareModalOpen(true)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleSubscribe = () => {
    setIsSubscribing(true)
    
    // Only trigger confetti when subscribing (not when unsubscribing)
    if (!isSubscribed) {
      // Get button position
      const button = subscribeButtonRef.current
      if (button) {
        const rect = button.getBoundingClientRect()
        const x = (rect.left + rect.right) / 2 / window.innerWidth
        const y = (rect.top + rect.bottom) / 2 / window.innerHeight

        // Calculate button dimensions for more focused effect
        const buttonWidth = rect.width / window.innerWidth
        const buttonHeight = rect.height / window.innerHeight

        // Trigger confetti effect centered on the button
        confetti({
          particleCount: 30,
          spread: 30,
          origin: { x, y },
          colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#FF4500'],
          shapes: ['star', 'circle'],
          scalar: 0.6,
          ticks: 100,
          gravity: 0.8,
          drift: 0,
        })

        // Add a second burst from the left
        setTimeout(() => {
          confetti({
            particleCount: 20,
            angle: 60,
            spread: 25,
            origin: { 
              x: x - (buttonWidth * 0.5),
              y: y + (buttonHeight * 0.2)
            },
            colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#FF4500'],
            shapes: ['star', 'circle'],
            scalar: 0.5,
            ticks: 100,
            gravity: 0.8,
            drift: 0,
          })
        }, 100)

        // Add a third burst from the right
        setTimeout(() => {
          confetti({
            particleCount: 20,
            angle: 120,
            spread: 25,
            origin: { 
              x: x + (buttonWidth * 0.5),
              y: y + (buttonHeight * 0.2)
            },
            colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#FF4500'],
            shapes: ['star', 'circle'],
            scalar: 0.5,
            ticks: 100,
            gravity: 0.8,
            drift: 0,
          })
        }, 200)

        // Add a fourth burst from the top
        setTimeout(() => {
          confetti({
            particleCount: 20,
            angle: 90,
            spread: 25,
            origin: { 
              x: x,
              y: y - (buttonHeight * 0.5)
            },
            colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#FF4500'],
            shapes: ['star', 'circle'],
            scalar: 0.5,
            ticks: 100,
            gravity: 0.8,
            drift: 0,
          })
        }, 300)
      }
    }

    setTimeout(() => {
      setIsSubscribed(!isSubscribed)
      setIsSubscribing(false)
    }, 300)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{video.title}</h1>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`/avatars/${video.uploader.split(" ")[0].toLowerCase()}.png`} alt={video.uploader} />
            <AvatarFallback>{video.uploader.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{video.uploader}</div>
            <div className="text-xs text-muted-foreground">20K subscribers</div>
          </div>
          <div className="relative">
            <Button
              ref={subscribeButtonRef}
              variant={isSubscribed ? "outline" : "default"}
              size="sm"
              className={`ml-2 transition-all duration-300 ${
                isSubscribed
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              } ${isSubscribing ? "scale-95" : "scale-100"}`}
              onClick={handleSubscribe}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
              {isSubscribing && <span className="absolute inset-0 rounded-md animate-pulse bg-primary/20"></span>}
              {isSubscribed && <span className="ml-2 text-green-500">✓</span>}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className={`transition-all duration-300 ${isLiked ? "animate-like" : ""}`}
                >
                  <ThumbsUp className={`h-4 w-4 mr-2`} />
                  <span>{likes}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLiked ? "Unlike" : "Like"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isDisliked ? "default" : "outline"}
                  size="sm"
                  onClick={handleDislike}
                  className={`transition-all duration-300`}
                >
                  <ThumbsDown className={`h-4 w-4 mr-2`} />
                  <span>{dislikes}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDisliked ? "Remove dislike" : "Dislike"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            <span>Share</span>
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isSaved ? "default" : "outline"}
                  size="sm"
                  onClick={handleSave}
                  className="transition-colors"
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                  <span>{isSaved ? "Saved" : "Save"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSaved ? "Remove from saved" : "Save for later"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              {video.views} views • {video.uploadDate}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-sm text-primary"
            >
              {isDescriptionExpanded ? "Show less" : "Show more"}
            </Button>
          </div>
          <p
            className={`text-sm whitespace-pre-line transition-all duration-500 ease-in-out overflow-hidden ${
              isDescriptionExpanded ? "max-h-[500px]" : "max-h-[4.5em]"
            }`}
          >
            {video.description}
          </p>
        </CardContent>
      </Card>

      {isShareModalOpen && (
        <ShareModal
          videoUrl={`${window.location.origin}/video/${video.id}`}
          videoTitle={video.title}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  )
}

