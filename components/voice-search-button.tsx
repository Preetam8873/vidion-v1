"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void
  onListening: (isListening: boolean) => void
  className?: string
}

const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onResult,
  onListening,
  className
}) => {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [transcript, setTranscript] = useState("")
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | null>(null)

  // Check microphone permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setPermissionStatus(permissionStatus.state)
        
        permissionStatus.onchange = () => {
          setPermissionStatus(permissionStatus.state)
        }
      } catch (error) {
        console.error('Error checking microphone permissions:', error)
      }
    }

    if (typeof window !== 'undefined') {
      checkPermissions()
    }
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setIsListening(true)
          onListening(true)
          setTranscript("")
        }

        recognition.onend = () => {
          setIsListening(false)
          onListening(false)
          // Send the final transcript when recognition ends
          if (transcript) {
            onResult(transcript)
          }
        }

        recognition.onresult = (event: any) => {
          const current = event.resultIndex
          const result = event.results[current]
          const transcriptText = result[0].transcript

          setTranscript(transcriptText)
          onResult(transcriptText)

          // Auto stop after 1.5 seconds of silence
          if (result.isFinal) {
            setTimeout(() => {
              if (recognition && isListening) {
                recognition.stop()
              }
            }, 1500)
          }
        }

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            setPermissionStatus('denied')
          } else if (event.error !== 'aborted') {
            console.error('Speech recognition error:', event.error)
          }
          setIsListening(false)
          onListening(false)
        }

        setRecognition(recognition)
      } else {
        setIsSupported(false)
      }
    }
  }, [onListening, onResult])

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setPermissionStatus('granted')
      return true
    } catch (error) {
      console.error('Error requesting microphone permission:', error)
      setPermissionStatus('denied')
      return false
    }
  }

  const toggleListening = useCallback(async () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      return
    }

    // Check if we need to request permissions
    if (permissionStatus !== 'granted') {
      const granted = await requestMicrophonePermission()
      if (!granted) return
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      setIsListening(false)
      onListening(false)
    }
  }, [recognition, isListening, onListening, permissionStatus])

  if (!isSupported) {
    return (
      <button
        className={cn(
          "p-2 text-muted-foreground transition-colors",
          "cursor-not-allowed opacity-50",
          className
        )}
        title="Voice search is not supported in your browser"
        disabled
      >
        <Mic className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleListening}
      className={cn(
        "text-muted-foreground transition-all duration-200 relative",
        isListening && "text-primary bg-primary/10",
        permissionStatus === 'denied' && "opacity-50 cursor-not-allowed",
        className
      )}
      title={
        permissionStatus === 'denied'
          ? "Microphone access denied. Click to request access"
          : isListening
          ? "Stop voice search"
          : "Start voice search"
      }
      disabled={permissionStatus === 'denied'}
    >
      {permissionStatus === 'denied' ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className={cn(
          "h-5 w-5 transition-transform duration-200",
          isListening && "scale-110"
        )} />
      )}
      {isListening && (
        <>
          {/* Ripple effect */}
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <span className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
          {/* Outer ring */}
          <span className="absolute inset-[-4px] rounded-full border-2 border-primary animate-[pulse_1.5s_ease-in-out_infinite]" />
        </>
      )}
    </button>
  )
}

export default VoiceSearchButton 