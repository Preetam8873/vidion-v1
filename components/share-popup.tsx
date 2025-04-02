import { Instagram, MessageCircle, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SharePopupProps {
  videoId: string
  title: string
}

export function SharePopup({ videoId, title }: SharePopupProps) {
  const shareUrl = `${window.location.origin}/video/${videoId}`

  const handleInstagramShare = () => {
    window.open(`https://www.instagram.com/share?url=${encodeURIComponent(shareUrl)}`)
  }

  const handleTelegramShare = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`)
  }

  const handleMessageShare = () => {
    window.open(`sms:?body=${encodeURIComponent(`Check out this video: ${title} ${shareUrl}`)}`)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Share className="h-5 w-5" />
          <span className="sr-only">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share video</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center space-x-4 py-4">
          {/* Instagram Share */}
          <Button
            variant="ghost"
            size="lg"
            className="flex flex-col items-center gap-2"
            onClick={handleInstagramShare}
          >
            <Instagram className="h-8 w-8 text-pink-600" />
            <span className="text-xs">Instagram</span>
          </Button>

          {/* Telegram Share */}
          <Button
            variant="ghost"
            size="lg"
            className="flex flex-col items-center gap-2"
            onClick={handleTelegramShare}
          >
            <Send className="h-8 w-8 text-blue-500" />
            <span className="text-xs">Telegram</span>
          </Button>

          {/* Message Share */}
          <Button
            variant="ghost"
            size="lg"
            className="flex flex-col items-center gap-2"
            onClick={handleMessageShare}
          >
            <MessageCircle className="h-8 w-8 text-green-500" />
            <span className="text-xs">Message</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 