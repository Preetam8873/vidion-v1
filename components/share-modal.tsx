"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy, Share2, Facebook, Twitter, Mail, Instagram, MessageCircle, Send } from "lucide-react"

type ShareOption = {
  name: string
  icon: React.ReactNode
  color: string
  url: string
}

interface ShareModalProps {
  videoUrl: string
  videoTitle: string
  onClose: () => void
}

export default function ShareModal({ videoUrl, videoTitle, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const encodedTitle = encodeURIComponent(videoTitle || "Check out this video")
  const encodedUrl = encodeURIComponent(videoUrl)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const shareOptions: ShareOption[] = [
    {
      name: "WhatsApp",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
          <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
          <path d="M9.5 13.5c.5 1.5 1.5 2 2.5 2s2-.5 2.5-2" />
        </svg>
      ),
      color: "bg-[#25D366] text-white",
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      color: "bg-[#1877F2] text-white",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      color: "bg-[#1DA1F2] text-white",
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
      color: "bg-[#E4405F] text-white",
      url: `https://www.instagram.com/share?url=${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: <Send className="h-5 w-5" />,
      color: "bg-[#0088cc] text-white",
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Message",
      icon: <MessageCircle className="h-5 w-5" />,
      color: "bg-[#00B300] text-white",
      url: `sms:?body=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5" />,
      color: "bg-gray-500 text-white",
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        className="
          backdrop-blur-sm 
          dark:backdrop-blur-xl 
          bg-background/60 
          dark:bg-background/30 
          border border-border/40 
          shadow-lg 
          rounded-xl
        "
      >
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Video
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 py-6">
          {shareOptions.map((option) => (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center`}>
                {option.icon}
              </div>
              <span className="text-xs">{option.name}</span>
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Input value={videoUrl} readOnly className="flex-1" />
          <Button size="sm" onClick={handleCopy} className="flex-shrink-0">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}