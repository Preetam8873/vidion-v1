"use client"

import { useEffect, useState } from "react"
import { videos } from "@/lib/data"; // Import your videos array
import VideoCard from "./video-card"; // Import your VideoCard component

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

const Home = () => {
  const [shuffledVideos, setShuffledVideos] = useState([]);

  useEffect(() => {
    // Shuffle the videos array when the component mounts
    const shuffled = shuffleArray([...videos]);
    console.log("Shuffled Videos:", shuffled); // Debugging log
    setShuffledVideos(shuffled);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {shuffledVideos.map((video, index) => (
        <VideoCard key={video.id} video={video} index={index} />
      ))}
    </div>
  );
};

export default Home; 