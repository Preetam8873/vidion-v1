"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface LazyImageProps {
  src: string
  alt: string
  [key: string]: any
}

export default function LazyImage({ src, alt, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>(src || '/placeholder.svg')

  useEffect(() => {
    if (!src) {
      setImageSrc('/placeholder.svg')
      return
    }

    // Handle Google Drive images
    if (src.includes('drive.google.com')) {
      const fileId = src.match(/[-\w]{25,}/)?.[0]
      if (fileId) {
        setImageSrc(`https://drive.google.com/uc?export=view&id=${fileId}`)
      } else {
        setImageSrc('/placeholder.svg')
      }
    } else {
      setImageSrc(src)
    }
  }, [src])

  return (
    <div className="relative w-full h-full">
      <Image
        src={imageSrc}
        alt={alt}
        {...props}
        className={`
          transition-opacity 
          duration-150 
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${props.className || ''}
        `}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setImageSrc('/placeholder.svg')
          setIsLoaded(true)
        }}
        loading="eager"
        priority={true}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm animate-pulse rounded-md flex items-center justify-center">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-1 border-2 border-primary/50 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
        </div>
      )}
    </div>
  )
}