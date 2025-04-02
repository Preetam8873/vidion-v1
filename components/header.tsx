"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Search, Moon, Sun, Menu, Bell, X, Info, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { NotificationPopup } from "@/components/notification-popup"
import * as _ from 'lodash'
import AboutUsDialog from "@/components/about-us-dialog"
import ContactDialog from "@/components/contact-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from 'framer-motion'
import VoiceSearchButton from '@/components/voice-search-button'

interface HeaderProps {
  onSearch: (query: string) => Promise<void>
  isHomePage?: boolean
}

function Header({ onSearch, isHomePage = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAboutUsDialogOpen, setIsAboutUsDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const [logoClicked, setLogoClicked] = useState(false)

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Modified debounced search to not close the search bar
  const debouncedSearch = useCallback(
    _.debounce(async (query: string) => {
      if (!isHomePage) return; // Don't perform real-time search on video player page
      try {
        setIsLoading(true)
        setError(null)
        await onSearch(query)
      } catch (err) {
        console.error("Search error:", err)
        setError("Failed to search videos. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }, 300),
    [onSearch, isHomePage]
  )

  // Handle input change without closing search
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    debouncedSearch(query)
  }, [debouncedSearch])

  // Handle search submit - only close on submit
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)
      await onSearch(searchQuery)
      // Close search only if form is submitted
      if (isHomePage) {
        setIsSearchOpen(false)
        setSearchQuery("")
      }
    } catch (err) {
      setError("Failed to search videos. Please try again.")
      console.error("Search error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        if (isHomePage) {
          setIsSearchOpen(false)
          setSearchQuery("") // Clear search when closing
          setError(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isHomePage])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Add error boundary
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Caught error:', error)
      setError("Something went wrong. Please refresh the page.")
      setIsLoading(false)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Update the mobile search section
  const mobileSearch = (
    <div ref={searchContainerRef}>
      {isSearchOpen ? (
        <div className="fixed inset-x-0 top-0 px-4 py-3 bg-background/80 backdrop-blur-md z-50 border-b">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder={isHomePage ? "Search videos..." : "Press enter to search..."}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-10 pl-4 pr-24 rounded-full border border-input bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none dark:bg-secondary/50"
                autoFocus
                disabled={isLoading}
              />
              <div className="absolute right-0 top-0 h-full flex items-center gap-1 px-2">
                <VoiceSearchButton
                  onResult={setSearchQuery}
                  onListening={(listening) => {
                    if (!listening && searchQuery) {
                      handleSearchSubmit(new Event('submit') as any)
                    }
                  }}
                  className="hover:bg-accent rounded-full"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery("")
                    setError(null)
                    onSearch("") // Clear search results
                  }}
                  className="rounded-full hover:bg-accent"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>
          {error && (
            <div className="mt-2 text-sm text-destructive text-center">
              {error}
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchOpen(true)}
          className="relative rounded-full hover:bg-accent"
        >
          <Search className="h-5 w-5" />
          {searchQuery && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
              {searchQuery.length}
            </span>
          )}
        </Button>
      )}
    </div>
  )

  // Update the desktop search section
  const desktopSearch = (
    <div className="flex items-center gap-2 flex-1 max-w-[600px] mx-4">
      <form onSubmit={handleSearchSubmit} className="relative flex-1">
        <div className="relative group">
          <Input
            type="search"
            placeholder={isHomePage ? "Search videos..." : "Press enter to search..."}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-11 pl-4 pr-12 rounded-lg border-2 border-input bg-background/80 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 dark:bg-secondary/30"
            disabled={isLoading}
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>
      <VoiceSearchButton
        onResult={(transcript) => {
          setSearchQuery(transcript);
          // Automatically submit search when voice input is complete
          if (transcript) {
            handleSearchSubmit(new Event('submit') as any);
          }
        }}
        onListening={(listening) => {
          if (!listening && searchQuery) {
            handleSearchSubmit(new Event('submit') as any);
          }
        }}
        className="hover:bg-accent rounded-lg h-11 w-11 flex items-center justify-center"
      />
    </div>
  )

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setLogoClicked(true)
    setTimeout(() => setLogoClicked(false), 1000)
    
    if (isHomePage) {
      window.location.reload()
    } else {
      router.push('/')
    }
  }

  const handleNotificationClick = () => {
    if (isMobile) {
      router.push('/notifications') // Navigate to notifications page on mobile
    } else {
      // Use existing notification popup for desktop
      const notificationButton = document.querySelector('[aria-label="Show notifications"]') as HTMLButtonElement;
      if (notificationButton) {
        notificationButton.click();
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Compute the class name based on the theme
  const headerClass = `sticky top-0 z-50 transition-all duration-300 ${
    theme === 'light' ? 'bg-white shadow-lg' : 'backdrop-blur-2xl bg-background/50'
  }`

  // Add safety check for mounting
  if (!mounted) {
    return null // Return null on server-side to prevent hydration issues
  }

  // Update the AnimatedLogo component with enhanced animations and particles
  const AnimatedLogo = () => (
    <motion.div 
      className="vidion-logo-container relative flex items-center"
      onHoverStart={() => setLogoHovered(true)}
      onHoverEnd={() => setLogoHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Logo Container with Enhanced Particles */}
      <div className="relative w-12 h-12">
        {/* Pulsing background glow */}
        <motion.div
          className="absolute inset-0 logo-bg-glow"
          animate={{
            scale: logoHovered ? [1, 1.4, 1] : [1, 1.2, 1],
            opacity: logoHovered ? [0.6, 0.9, 0.6] : [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Enhanced Triangle Logo */}
        <motion.svg
          viewBox="0 0 48 48"
          className="w-full h-full relative z-10"
        >
          {/* Glowing background effect */}
          <motion.path
            d="M24 44 L44 4 L4 4 Z"
            className="triangle-glow"
            animate={{
              filter: logoHovered 
                ? ['drop-shadow(0 0 8px currentColor)', 'drop-shadow(0 0 16px currentColor)', 'drop-shadow(0 0 8px currentColor)']
                : ['drop-shadow(0 0 4px currentColor)', 'drop-shadow(0 0 8px currentColor)', 'drop-shadow(0 0 4px currentColor)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Main triangle outline */}
          <motion.path
            d="M24 44 L44 4 L4 4 Z"
            className="triangle-shape"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: 1,
              stroke: logoHovered 
                ? [theme === 'dark' ? '#00f5ff' : '#4f46e5', theme === 'dark' ? '#3b82f6' : '#818cf8', theme === 'dark' ? '#00f5ff' : '#4f46e5']
                : theme === 'dark' ? '#00f5ff' : '#4f46e5'
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Inner accent lines with glow */}
          <motion.path
            d="M24 40 L40 8 L8 8 Z"
            className="triangle-accent"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />

          {/* Energy flow lines */}
          {[...Array(6)].map((_, i) => (
            <motion.path
              key={`flow-${i}`}
              d={`M24 44 C${24 + i * 2} 30 ${24 - i * 2} 16 24 4`}
              className="energy-flow-line"
              strokeDasharray="4,6"
              animate={{
                strokeDashoffset: [0, -20],
                opacity: logoHovered ? [0.8, 0.4] : [0.4, 0.2],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}

          {/* Spinning accent circles */}
          {[...Array(3)].map((_, i) => (
            <motion.circle
              key={`accent-${i}`}
              cx="24"
              cy="24"
              r={8 + i * 4}
              className="accent-circle"
              animate={{
                rotate: [0, 360],
                opacity: logoHovered ? [0.4, 0.2] : [0.2, 0.1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </motion.svg>

        {/* Enhanced orbital particles */}
        {[...Array(36)].map((_, i) => (
          <motion.div
            key={`orbit-${i}`}
            className="orbital-particle"
            animate={logoHovered ? {
              scale: [0.8, 1.2, 0.8],
              opacity: [0.4, 1, 0.4],
            } : {
              scale: [0.6, 0.8, 0.6],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              delay: i * 0.1,
            }}
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${i * 10}deg) translateX(${20 + (i % 4) * 8}px)`,
            }}
          />
        ))}

        {/* Floating dust particles */}
        {logoHovered && [...Array(60)].map((_, i) => (
          <motion.div
            key={`dust-${i}`}
            className="dust-particle"
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: (Math.random() - 0.5) * 120,
              y: (Math.random() - 0.5) * 120,
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.03,
            }}
          />
        ))}

        {/* Energy burst effect on hover */}
        {logoHovered && (
          <motion.div
            className="energy-burst"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.5, 0.8],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        )}
      </div>

      {/* VIDION Text */}
      <motion.div 
        className="ml-4 vidion-text-container"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {/* Moving neon border line */}
        <motion.div 
          className="neon-line"
          animate={{
            x: ['0%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* VIDION text with enhanced effects */}
        {'VIDION'.split('').map((letter, i) => (
          <motion.span
            key={i}
            className="vidion-letter"
            animate={logoHovered ? {
              y: [-2, 2, -2],
              scale: [1, 1.1, 1],
              filter: [
                'drop-shadow(0 0 5px var(--neon-color))',
                'drop-shadow(0 0 15px var(--neon-color))',
                'drop-shadow(0 0 5px var(--neon-color))'
              ],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          >
            {letter}
            
            {/* Individual letter particles */}
            {logoHovered && [...Array(8)].map((_, j) => (
              <motion.div
                key={`letter-particle-${i}-${j}`}
                className="letter-particle"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 50,
                  y: (Math.random() - 0.5) * 50,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  delay: j * 0.1,
                }}
              />
            ))}
          </motion.span>
        ))}

        {/* Enhanced particle effects */}
        {logoHovered && (
          <>
            {/* Orbital particles */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`orbital-${i}`}
                className="text-orbital-particle"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                }}
                animate={{
                  x: Math.cos(i * Math.PI / 20) * 100,
                  y: Math.sin(i * Math.PI / 20) * 40,
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}

            {/* Floating dust particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={`dust-${i}`}
                className="text-dust-particle"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 150,
                  y: (Math.random() - 0.5) * 60,
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.03,
                }}
              />
            ))}

            {/* Energy trails */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`trail-${i}`}
                className="text-energy-trail"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <header className={headerClass}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap');
        
        .font-display {
          font-family: 'Orbitron', sans-serif;
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        .pulse-stroke {
          animation: pulse 2s infinite;
        }
        
        .circuit-line {
          stroke-dasharray: 15;
          stroke-dashoffset: 15;
          animation: draw 3s infinite alternate;
        }
        
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .glowing-dot {
          filter: drop-shadow(0 0 2px rgba(79, 70, 229, 0.8));
        }
        
        .vidion-logo-container:hover .circuit-line {
          animation-duration: 1.5s;
        }
        
        @media (max-width: 768px) {
          .custom-cursor {
            display: none !important;
          }
          * {
            cursor: auto !important;
          }
        }

        /* Logo Styles */
        .vidion-logo-container {
          position: relative;
          z-index: 10;
        }

        .v-logo {
          position: relative;
          color: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          filter: drop-shadow(0 0 10px ${theme === 'dark' ? '#00f5ff60' : '#4f46e560'});
        }

        .v-main-path {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawV 2s ease forwards;
        }

        .v-accent-path {
          opacity: 0.6;
          filter: blur(1px);
        }

        .energy-particle {
          fill: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          filter: drop-shadow(0 0 5px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
        }

        .pulse-ring {
          border-radius: 50%;
          background: radial-gradient(
            circle,
            ${theme === 'dark' ? '#00f5ff40' : '#4f46e540'} 0%,
            transparent 70%
          );
        }

        .burst-effect {
          background: radial-gradient(
            circle,
            ${theme === 'dark' ? '#00f5ff' : '#4f46e5'} 0%,
            transparent 70%
          );
          border-radius: 50%;
          pointer-events: none;
        }

        .hover-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          border-radius: 50%;
          pointer-events: none;
          filter: drop-shadow(0 0 2px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
        }

        .letter-span {
          display: inline-block;
          position: relative;
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 1.75rem;
          transition: all 0.3s ease;
          text-shadow: 0 0 8px ${theme === 'dark' ? '#00f5ff40' : '#4f46e540'};
        }

        .letter-span::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .vidion-logo-container:hover .letter-span::before {
          transform: scaleX(1);
        }

        .vidion-logo-container:hover .letter-span {
          text-shadow: 0 0 12px ${theme === 'dark' ? '#00f5ff80' : '#4f46e580'};
        }

        .vidion-logo-container:hover .letter-span {
          background: linear-gradient(
            to bottom,
            ${theme === 'dark' 
              ? '#00f5ff, #3b82f6' 
              : '#4f46e5, #818cf8'}
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 2px ${theme === 'dark' ? '#00f5ff40' : '#4f46e540'});
        }

        .vidion-logo-container:hover .letter-span {
          filter: drop-shadow(0 0 4px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'})
                 drop-shadow(0 0 8px ${theme === 'dark' ? '#00f5ff80' : '#4f46e580'});
        }

        .vidion-logo-container:hover .letter-span:nth-child(1) { animation-delay: 0s; }
        .vidion-logo-container:hover .letter-span:nth-child(2) { animation-delay: 0.1s; }
        .vidion-logo-container:hover .letter-span:nth-child(3) { animation-delay: 0.2s; }
        .vidion-logo-container:hover .letter-span:nth-child(4) { animation-delay: 0.3s; }
        .vidion-logo-container:hover .letter-span:nth-child(5) { animation-delay: 0.4s; }
        .vidion-logo-container:hover .letter-span:nth-child(6) { animation-delay: 0.5s; }

        .idion-text {
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 1.75rem;
          background: linear-gradient(
            45deg,
            ${theme === 'dark' ? '#00f5ff, #3b82f6' : '#4f46e5, #818cf8'}
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 2px ${theme === 'dark' ? '#00f5ff30' : '#4f46e530'});
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .vidion-logo-container {
          animation: float 3s ease-in-out infinite;
        }

        /* Enhanced click animation */
        .vidion-logo-container:active .v-logo {
          transform: scale(0.9);
          transition: transform 0.2s ease;
        }

        .vidion-logo-container:active .letter-span {
          transform: scale(0.95);
          transition: transform 0.2s ease;
        }

        .v-shape {
          stroke-width: 4;
          stroke: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          fill: none;
          filter: drop-shadow(0 0 8px ${theme === 'dark' ? '#00f5ff80' : '#4f46e580'});
        }

        .v-accent {
          stroke-width: 2;
          stroke: ${theme === 'dark' ? '#3b82f6' : '#818cf8'};
          fill: none;
          opacity: 0.6;
        }

        .energy-line {
          stroke: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          stroke-width: 2;
          fill: none;
          opacity: 0.3;
        }

        .logo-bg-glow {
          background: radial-gradient(
            circle,
            ${theme === 'dark' ? '#00f5ff20' : '#4f46e520'} 0%,
            transparent 70%
          );
          filter: blur(8px);
        }

        .orbital-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          border-radius: 50%;
          filter: drop-shadow(0 0 4px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
        }

        .burst-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          border-radius: 50%;
          pointer-events: none;
          filter: drop-shadow(0 0 4px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
        }

        .vidion-text {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 1.75rem;
          display: flex;
          gap: 1px;
        }

        .letter-span {
          display: inline-block;
          position: relative;
          transition: all 0.3s ease;
        }

        .letter-span::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .vidion-logo-container:hover .letter-span::after {
          transform: scaleX(1);
        }

        /* Enhanced hover animations */
        .vidion-logo-container:hover .triangle-shape {
          filter: drop-shadow(0 0 12px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
          animation: pulseShadow 2s infinite;
        }

        .vidion-logo-container:hover .orbital-particle {
          animation-duration: 1.5s;
          filter: drop-shadow(0 0 6px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
        }

        @keyframes pulseShadow {
          0%, 100% {
            filter: drop-shadow(0 0 12px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
          }
          50% {
            filter: drop-shadow(0 0 20px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
          }
        }

        /* Light mode specific enhancements */
        .light .vidion-logo-container {
          --glow-intensity: 1.5;
          --particle-speed: 1.2;
        }

        .light .vidion-logo-container:hover .triangle-shape {
          filter: drop-shadow(0 0 20px #4f46e5);
        }

        .light .dust-particle {
          background: linear-gradient(45deg, #4f46e5, #818cf8);
        }

        .triangle-glow {
          fill: none;
          stroke: ${theme === 'dark' ? '#00f5ff20' : '#4f46e520'};
          stroke-width: 8;
        }

        .triangle-shape {
          stroke-width: 4;
          stroke: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          fill: none;
          filter: drop-shadow(0 0 8px ${theme === 'dark' ? '#00f5ff80' : '#4f46e580'});
        }

        .triangle-accent {
          stroke-width: 2;
          stroke: ${theme === 'dark' ? '#3b82f6' : '#818cf8'};
          fill: none;
          opacity: 0.6;
          filter: drop-shadow(0 0 4px ${theme === 'dark' ? '#00f5ff40' : '#4f46e540'});
        }

        .energy-flow-line {
          stroke: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          stroke-width: 2;
          fill: none;
          filter: drop-shadow(0 0 3px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
        }

        .accent-circle {
          fill: none;
          stroke: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          stroke-width: 1;
          stroke-dasharray: 10,5;
        }

        .orbital-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          border-radius: 50%;
          filter: drop-shadow(0 0 4px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
        }

        .dust-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          border-radius: 50%;
          pointer-events: none;
          filter: drop-shadow(0 0 3px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
        }

        .energy-burst {
          position: absolute;
          inset: -20%;
          background: radial-gradient(
            circle,
            ${theme === 'dark' ? '#00f5ff40' : '#4f46e540'} 0%,
            transparent 70%
          );
          border-radius: 50%;
          pointer-events: none;
        }

        .logo-bg-glow {
          background: radial-gradient(
            circle,
            ${theme === 'dark' ? '#00f5ff20' : '#4f46e520'} 0%,
            transparent 70%
          );
          filter: blur(8px);
        }

        /* Enhanced hover effects */
        .vidion-logo-container:hover .triangle-shape {
          filter: drop-shadow(0 0 16px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
          animation: pulseShadow 2s infinite;
        }

        .vidion-logo-container:hover .orbital-particle {
          animation-duration: 1.5s;
          filter: drop-shadow(0 0 6px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
        }

        @keyframes pulseShadow {
          0%, 100% {
            filter: drop-shadow(0 0 12px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
          }
          50% {
            filter: drop-shadow(0 0 20px ${theme === 'dark' ? '#00f5ff' : '#4f46e5'});
          }
        }

        /* Light mode enhancements */
        .light .vidion-logo-container {
          --glow-intensity: 1.5;
          --particle-speed: 1.2;
        }

        .light .vidion-logo-container:hover .triangle-shape {
          filter: drop-shadow(0 0 20px #4f46e5);
        }

        .light .dust-particle {
          background: linear-gradient(45deg, #4f46e5, #818cf8);
        }

        .vidion-text-container {
          position: relative;
          display: flex;
          padding: 0.5rem 1rem;
          gap: 2px;
          overflow: visible;
          --neon-color: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
        }

        .neon-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 30%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--neon-color),
            transparent
          );
          filter: blur(1px);
        }

        .vidion-letter {
          display: inline-block;
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 1.75rem;
          color: ${theme === 'dark' ? '#00f5ff' : '#4f46e5'};
          position: relative;
          z-index: 1;
        }

        .letter-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: var(--neon-color);
          border-radius: 50%;
          pointer-events: none;
          filter: drop-shadow(0 0 2px var(--neon-color));
        }

        .text-orbital-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: var(--neon-color);
          border-radius: 50%;
          pointer-events: none;
          filter: drop-shadow(0 0 3px var(--neon-color));
        }

        .text-dust-particle {
          position: absolute;
          width: 1px;
          height: 1px;
          background: var(--neon-color);
          border-radius: 50%;
          pointer-events: none;
          filter: drop-shadow(0 0 2px var(--neon-color));
        }

        .text-energy-trail {
          position: absolute;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--neon-color),
            transparent
          );
          filter: blur(1px);
          transform-origin: center;
        }

        /* Fix dark mode hover issue */
        .dark .vidion-letter {
          color: #00f5ff;
          text-shadow: 0 0 15px #00f5ff;
        }

        .dark .vidion-text-container:hover .vidion-letter {
          color: #00f5ff;
          text-shadow: 0 0 20px #00f5ff;
        }

        /* Light mode enhancements */
        .light .vidion-letter {
          color: #4f46e5;
          text-shadow: 0 0 15px #4f46e580;
        }

        .light .vidion-text-container:hover .vidion-letter {
          color: #4f46e5;
          text-shadow: 0 0 20px #4f46e5;
        }

        /* Enhanced particle animations */
        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-10px) translateX(5px);
          }
        }

        .vidion-text-container:hover {
          .text-orbital-particle {
            animation: floatParticle 3s infinite;
          }
          
          .text-dust-particle {
            animation-duration: 2s;
          }
          
          .letter-particle {
            animation-duration: 1.5s;
          }
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Modernized Logo */}
          <Link 
            href="/" 
            onClick={handleLogoClick}
            className="flex items-center gap-2"
          >
            <AnimatedLogo />
          </Link>

          {/* Desktop Search */}
          {!isMobile && (
            <div className="flex items-center gap-2 flex-1 max-w-[600px] mx-4">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <div className="relative group">
                  <Input
                    type="search"
                    placeholder={isHomePage ? "Search videos..." : "Press enter to search..."}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full h-11 pl-4 pr-12 rounded-lg border-2 border-input bg-background/80 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 dark:bg-secondary/30"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                  <button 
                    type="submit" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
              <VoiceSearchButton
                onResult={(transcript) => {
                  setSearchQuery(transcript);
                  // Automatically submit search when voice input is complete
                  if (transcript) {
                    handleSearchSubmit(new Event('submit') as any);
                  }
                }}
                onListening={(listening) => {
                  if (!listening && searchQuery) {
                    handleSearchSubmit(new Event('submit') as any);
                  }
                }}
                className="hover:bg-accent rounded-lg h-11 w-11 flex items-center justify-center"
              />
            </div>
          )}

          {/* Mobile Search */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <div ref={searchContainerRef}>
                {isSearchOpen ? (
                  <div className="fixed inset-x-0 top-0 px-4 py-3 bg-background/95 backdrop-blur-md z-50 border-b border-border/40">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                      <div className="relative flex-1 group">
                        <Input
                          type="search"
                          placeholder={isHomePage ? "Search videos..." : "Press enter to search..."}
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="w-full h-11 pl-4 pr-12 rounded-lg border-2 border-input bg-background/80 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 dark:bg-secondary/30"
                          autoFocus
                          disabled={isLoading}
                        />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                        <button 
                          type="submit" 
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Search className="h-5 w-5" />
                        </button>
                      </div>
                    </form>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchQuery("")
                        setError(null)
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg hover:bg-accent"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSearchOpen(true)}
                      className="rounded-lg hover:bg-accent"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                    <VoiceSearchButton
                      onResult={(transcript) => {
                        setSearchQuery(transcript);
                        // Automatically submit search when voice input is complete
                        if (transcript) {
                          handleSearchSubmit(new Event('submit') as any);
                        }
                      }}
                      onListening={(listening) => {
                        if (!listening && searchQuery) {
                          handleSearchSubmit(new Event('submit') as any);
                        }
                      }}
                      className="hover:bg-accent rounded-lg h-10 w-10 flex items-center justify-center"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Icons */}
          {isMobile ? (
            <div className="flex items-center gap-2">
              {/* Profile Button - Only show when search is not open */}
              {!isSearchOpen && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt="VIDION" />
                        <AvatarFallback>V</AvatarFallback>
                      </Avatar>
                    </Button>
                  </SheetTrigger>
                  <SheetContent 
                    side="right" 
                    className="w-[280px] sm:w-[340px] backdrop-blur-lg bg-background/80"
                  >
                    <div className="flex flex-col gap-6 h-full">
                      {/* Profile Section */}
                      <div className="flex items-center gap-4 pb-4 border-b">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/avatars/01.png" alt="VIDION" />
                          <AvatarFallback>V</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">VIDION</h4>
                          <p className="text-sm text-muted-foreground">spectre@example.com</p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-col gap-4">
                        {/* Theme Toggle Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-4"
                          onClick={toggleTheme}
                        >
                          <span className="text-sm font-medium">Theme</span>
                          <span className="flex items-center">
                            {theme === "dark" ? (
                              <Sun className="h-4 w-4" />
                            ) : (
                              <Moon className="h-4 w-4" />
                            )}
                          </span>
                        </Button>

                        {/* Notifications Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-4"
                          onClick={handleNotificationClick}
                        >
                          <span className="text-sm font-medium">Notifications</span>
                          <Bell className="h-4 w-4" />
                        </Button>

                        {/* About Us Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-4"
                          onClick={() => setIsAboutUsDialogOpen(true)}
                        >
                          <span className="text-sm font-medium">About Us</span>
                          <Info className="h-4 w-4" />
                        </Button>

                        {/* Contact Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-4"
                          onClick={() => setIsContactDialogOpen(true)}
                        >
                          <span className="text-sm font-medium">Contact</span>
                          <MessageSquare className="h-4 w-4" />
                        </Button>

                        {/* Sign Out Button */}
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between px-4 text-red-500 hover:text-red-600 hover:bg-red-100/10"
                        >
                          <span className="text-sm font-medium">Sign out</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          ) : (
            // Desktop icons section
            <>
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-10 w-10"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>

                {/* Notifications */}
                <NotificationPopup />

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt="VIDION" />
                        <AvatarFallback>V</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setIsAboutUsDialogOpen(true)}>
                      About Us
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setIsContactDialogOpen(true)}>
                      Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 p-2 bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {/* About Us Dialog */}
      <Dialog open={isAboutUsDialogOpen} onOpenChange={setIsAboutUsDialogOpen}>
        <DialogContent className="glass-morphism sm:max-w-[525px] gap-6">
          <button
            onClick={() => setIsAboutUsDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center font-display bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
              About Us
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-lg font-medium text-foreground">
              Welcome to VIDION
            </p>
            <p className="text-base text-foreground-90 leading-relaxed">
              Your premier destination for educational content and video streaming. We are dedicated to making high-quality educational resources accessible to everyone, anywhere in the world.
            </p>
            <p className="text-base text-foreground-90 leading-relaxed">
              Our platform offers a diverse range of educational videos, tutorials, and resources to support your learning journey. We believe in the power of knowledge sharing and continuous learning.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="glass-morphism-contact sm:max-w-[425px] overflow-hidden">
          <button
            onClick={() => setIsContactDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center font-display bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent mb-4">
              Contact Us
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            <div className="contact-info-card glass-card">
              <div className="space-y-4">
                {/* Phone Contact */}
                <div className="contact-item glass-item group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📞</span>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <a href="tel:+919798292134" className="text-foreground-90 break-all">
                        +91 9798292134
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Email Contact */}
                <div className="contact-item glass-item group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">✉️</span>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a href="mailto:preetam@engineer.com" className="text-foreground-90 break-all">
                        preetam@engineer.com
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Academic Email */}
                <div className="contact-item glass-item group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🎓</span>
                    <div>
                      <p className="font-medium text-foreground">Academic</p>
                      <a href="mailto:preetam.kumar.cs.2022@mitmeerut.ac.in" className="text-foreground-90 break-all">
                        preetam.kumar.cs.2022@mitmeerut.ac.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          
          <div className="contact-whatsapp-card glass-card">
            <a 
              href="https://wa.me/+919798292134" 
              target="_blank" 
              rel="noopener noreferrer"
              className="whatsapp-button glass-button group"
            >
              <div className="flex items-center justify-center gap-3">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  className="w-6 h-6 fill-current text-[#25D366] group-hover:scale-110 transition-transform"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="font-medium text-foreground">Contact on WhatsApp</span>
              </div>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </header>
)
}

export default Header

