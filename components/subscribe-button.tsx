"use client"

import React from 'react'
import confetti from 'canvas-confetti'

const SubscribeButton = () => {
  const handleSubscribe = () => {
    // Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#FF4500'],
      shapes: ['star', 'circle'],
      scalar: 1.2,
      ticks: 200,
      gravity: 0.8,
      drift: 0,
    })

    // Add a second burst of confetti
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#FF4500'],
        shapes: ['star', 'circle'],
        scalar: 1.2,
        ticks: 200,
        gravity: 0.8,
        drift: 0,
      })
    }, 250)

    // Add a third burst from the right
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#FF4500'],
        shapes: ['star', 'circle'],
        scalar: 1.2,
        ticks: 200,
        gravity: 0.8,
        drift: 0,
      })
    }, 400)
  }

  return (
    <button
      onClick={handleSubscribe}
      className="relative overflow-visible rounded-full hover:-translate-y-1 px-12 py-3 shadow-xl bg-background/30 
                 after:content-[''] after:absolute after:rounded-full after:inset-0 after:bg-background/40 
                 after:z-[-1] after:transition after:!duration-500 hover:after:scale-150 hover:after:opacity-0
                 text-white font-semibold transition-all duration-300 hover:shadow-2xl
                 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
    >
      Subscribe Now
    </button>
  )
}

export default SubscribeButton 