"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, Flag, Reply } from "lucide-react"

// Sample comments data
const demoComments = [
  {
    id: 1,
    user: "Alex Johnson",
    avatar: "/avatars/avatar-1.png",
    content: "This is exactly what I needed to understand the concept! The explanation at 2:15 was especially helpful.",
    timestamp: "2 days ago",
    likes: 24,
    replies: [
      {
        id: 101,
        user: "Maria Garcia",
        avatar: "/avatars/avatar-2.png",
        content: "I agree! That part really cleared things up for me too.",
        timestamp: "1 day ago",
        likes: 7,
      },
    ],
  },
  {
    id: 2,
    user: "Sam Chen",
    avatar: "/avatars/avatar-3.png",
    content: "Great video! Could you please make a follow-up explaining more advanced techniques?",
    timestamp: "5 days ago",
    likes: 15,
    replies: [],
  },
  {
    id: 3,
    user: "Jamie Taylor",
    avatar: "/avatars/avatar-4.png",
    content:
      "I've been looking for content like this for months. Your explanation style is so clear and easy to follow.",
    timestamp: "1 week ago",
    likes: 42,
    replies: [],
  },
]

export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState(demoComments)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState("")

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment = {
      id: comments.length + 1,
      user: "Current User",
      avatar: "/avatars/current-user.png",
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      replies: [],
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleAddReply = (commentId) => {
    if (!replyContent.trim()) return

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: Math.random() * 1000,
              user: "Current User",
              avatar: "/avatars/current-user.png",
              content: replyContent,
              timestamp: "Just now",
              likes: 0,
            },
          ],
        }
      }
      return comment
    })

    setComments(updatedComments)
    setReplyingTo(null)
    setReplyContent("")
  }

  const handleLike = (commentId) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, likes: comment.likes + 1 }
      }
      return comment
    })

    setComments(updatedComments)
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-6">Comments ({comments.length})</h3>

      <div className="mb-8">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/avatars/current-user.png" alt="Current User" />
            <AvatarFallback>CU</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2 min-h-[60px]"
            />
            <div className="flex justify-end">
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-card rounded-lg p-4">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={comment.avatar} alt={comment.user} />
                <AvatarFallback>{comment.user.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{comment.user}</span>
                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                </div>
                <p className="text-sm mb-3">{comment.content}</p>
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{comment.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="ml-auto flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    <span>Report</span>
                  </Button>
                </div>

                {/* Reply form */}
                {replyingTo === comment.id && (
                  <div className="mt-4 ml-6">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/avatars/current-user.png" alt="Current User" />
                        <AvatarFallback>CU</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Add a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="mb-2 min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setReplyingTo(null)}>
                            Cancel
                          </Button>
                          <Button onClick={() => handleAddReply(comment.id)} disabled={!replyContent.trim()}>
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="mt-4 ml-6 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={reply.avatar} alt={reply.user} />
                          <AvatarFallback>{reply.user.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{reply.user}</span>
                            <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                          </div>
                          <p className="text-sm mb-2">{reply.content}</p>
                          <div className="flex gap-4">
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{reply.likes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

