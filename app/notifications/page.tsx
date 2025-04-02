"use client"

import { useEffect, useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { videos } from "@/lib/data" // Import your video data
import Image from "next/image"

// Define the Notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  thumbnail: string;
  url: string;
  timestamp: number; // Add timestamp for proper sorting
  profilePhoto: string; // Add profile photo field
}

// Function to generate random time strings
const getRandomTime = () => {
  const times = [
    "just now",
    "56 seconds ago",
    "2 minutes ago",
    "5 minutes ago",
    "10 minutes ago",
    "30 minutes ago",
    "1 hour ago",
    "2 hours ago",
    "1 day ago",
    "3 days ago",
    "1 week ago",
    "2 weeks ago",
    "4 weeks ago",
  ];
  return times[Math.floor(Math.random() * times.length)];
};

// Function to get random videos with timestamps
const getRandomVideos = (videoArray: any[], count: number) => {
  const now = Date.now();
  const shuffled = videoArray.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((video, index) => ({
    ...video,
    timestamp: now - (index * 1000 * 60 * 60) // Generate timestamps in descending order
  }));
};

// Preload images function using native Image constructor
const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    const img = new window.Image();
    img.src = url;
  });
};

const fetchData = async () => {
  try {
    const response = await fetch('/your-api-endpoint', {
      method: 'GET', // or POST, PUT, DELETE
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw to handle it in the component
  }
};

// Static profile image URL
const PROFILE_IMAGE_URL = "https://i.postimg.cc/R03LypvV/PXL_20230705_131447762.PORTRAIT.jpg";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Get 11 random videos from the imported video data
    const randomVideos = getRandomVideos(videos, 11);

    // Generate notifications based on the random videos
    const generatedNotifications = randomVideos.map(video => ({
      id: video.id.toString(),
      title: video.title,
      message: `Check out our latest video titled "${video.title}!"`,
      time: getRandomTime(),
      thumbnail: video.thumbnail,
      url: `/video/${video.id}`,
      timestamp: video.timestamp,
      profilePhoto: PROFILE_IMAGE_URL // Add the profile photo field
    }));

    // Sort by timestamp (newest first)
    const sortedNotifications = generatedNotifications.sort((a, b) => b.timestamp - a.timestamp);

    // Preload both thumbnails and profile photo immediately
    const allImages = [
      PROFILE_IMAGE_URL,
      ...sortedNotifications.map(n => n.thumbnail)
    ];
    preloadImages(allImages);

    setNotifications(sortedNotifications);
    setFilteredNotifications(sortedNotifications);
    setIsLoading(false);

    // Setup intersection observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            observerRef.current?.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleVideoClick = (url: string) => {
    router.push(url);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(query);
    
    if (!query) {
      setFilteredNotifications(notifications);
      return;
    }

    // Filter notifications in real-time based on the search query
    const results = notifications.filter(notification => {
      const searchableText = `${notification.title} ${notification.message}`.toLowerCase();
      return searchableText.includes(query);
    });
    
    setFilteredNotifications(results);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 border-b backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center p-4 rounded-lg border bg-card animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-4" />
                  <div className="flex-1 space-y-2 mr-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                  <div className="h-16 w-24 rounded-md bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🔔</div>
              <h2 className="text-2xl font-bold mb-4">No notifications found</h2>
              <p className="text-muted-foreground">Try adjusting your search</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className="flex items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleVideoClick(notification.url)}
                >
                  {/* Profile Photo */}
                  <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0 mr-4">
                    <Image
                      src={notification.profilePhoto}
                      alt="Channel Profile"
                      fill
                      className="object-cover"
                      sizes="40px"
                      priority={true}
                      loading="eager"
                      quality={75}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-medium truncate">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {notification.time}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative h-16 w-24 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={notification.thumbnail}
                      alt={notification.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 96px, 96px"
                      priority={index < 3}
                      loading={index < 3 ? "eager" : "lazy"}
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABQMEBAQDBQQEBAUFBQYHDAgHBwcHDwsLCQwRDxISEQ8RERMWHBcTFBoVEREYIRgaHR0fHx8TFyIkIh4kHB4fHv/bAEMBBQUFBwYHDggIDh4UERQeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHv/AABEIAAoAEAMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAGB//EACQQAAEDAwIHAAAAAAAAAAAAAAECAwQABREGEgcTISIxQWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAE/8QAGhEAAgIDAAAAAAAAAAAAAAAAAQIAAxESIf/aAAwDAQACEQMRAD8AqjThqoNpUOdqSUy7juxEjq6Z9noK0b9b1XfTcyI2sIddZUhCj4BJABPvGaqOJlpbt+sEyEM8qSgKcwMDdnBz+VYdnLu2PiLAnmK5iW2xzCM9hjp+UyGdLoWgbjR9rf/Z"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
