"use client";
import { useEffect, useState } from "react";

const useFluidCursor = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = document.getElementById('fluid') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Cursor variables
    let cursor = { x: 0, y: 0 };
    let particles: Array<{x: number; y: number; vx: number; vy: number}> = [];
    const particleCount = 100;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0
      });
    }

    // Update cursor position
    const updateCursor = (e: MouseEvent) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    };
    window.addEventListener('mousemove', updateCursor);

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        // Calculate direction to cursor
        const dx = cursor.x - particle.x;
        const dy = cursor.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Update velocity
        if (dist < 200) {
          const force = (200 - dist) / 200;
          particle.vx += (dx / dist) * force * 0.2;
          particle.vy += (dy / dist) * force * 0.2;
        }

        // Apply velocity
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Dampen velocity
        particle.vx *= 0.95;
        particle.vy *= 0.95;

        // Draw particle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', updateCursor);
    };
  }, []);

  return null;
};

export default useFluidCursor;
