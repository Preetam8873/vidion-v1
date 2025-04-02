'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import gsap from 'gsap';

interface CursorCoreProps {
  theme: 'dark' | 'light';
  cursorVariant?: string;
  clickProgress: number;
  speed: number;
}

const CursorCore: React.FC<CursorCoreProps> = ({ theme, cursorVariant, clickProgress, speed }) => {
  const variants = {
    dark: {
      primary: '#00f3ff',
      secondary: '#7d00ff',
      glass: 'rgba(0, 243, 255, 0.1)',
      glow: 'rgba(0, 243, 255, 0.3)'
    },
    light: {
      primary: '#2f80ed',
      secondary: '#eb5757',
      glass: 'rgba(255, 255, 255, 0.2)',
      glow: 'rgba(47, 128, 237, 0.2)'
    }
  };

  const glowIntensity = Math.min(speed * 0.5, 1);
  const scale = 1 + Math.min(speed * 0.1, 0.2);

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(-10deg) scale(${scale})` }}
    >
      {/* Main cursor shape - point is at (8,4) */}
      <path
        d="M8 4L24 16L18 18L22 26L18 28L14 20L8 24L8 4Z"
        fill={variants[theme].glass}
        stroke={variants[theme].primary}
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter={`drop-shadow(0 0 ${4 + glowIntensity * 4}px ${variants[theme].glow})`}
      />
      
      {/* Holographic effect */}
      <path
        d="M8 4L24 16L18 18L22 26L18 28L14 20L8 24L8 4Z"
        stroke={`url(#hologram-${theme})`}
        strokeWidth="2"
        strokeOpacity={0.3 + glowIntensity * 0.2}
      />
      
      {/* Click effect */}
      {clickProgress > 0 && (
        <>
          <circle
            cx="8"
            cy="4"
            r={16 * clickProgress}
            stroke={variants[theme].secondary}
            strokeWidth={2 - clickProgress}
            fill="none"
            opacity={1 - clickProgress}
            filter={`blur(${clickProgress * 2}px)`}
          />
          <circle
            cx="8"
            cy="4"
            r={12 * clickProgress}
            stroke={variants[theme].primary}
            strokeWidth={1.5 - clickProgress}
            fill="none"
            opacity={0.8 - clickProgress}
            filter={`blur(${clickProgress * 1.5}px)`}
          />
        </>
      )}
      
      <defs>
        <linearGradient id={`hologram-${theme}`}>
          <stop offset="0%" stopColor={variants[theme].primary} />
          <stop offset="100%" stopColor={variants[theme].secondary} />
        </linearGradient>
      </defs>
    </svg>
  );
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  decay: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export const CustomCursor = () => {
  const { resolvedTheme } = useTheme();
  const cursorRef = useRef<HTMLDivElement>(null);
  const particleCanvas = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default to true to prevent flash on mobile

  const [cursorState, setCursorState] = useState({
    position: { x: -100, y: -100 },
    velocity: { x: 0, y: 0 },
    variant: 'default',
    clickProgress: 0,
    particleCount: 0,
    clickPosition: { x: 0, y: 0 },
    speed: 0
  });

  // Particle system configuration
  const particles = useRef<Particle[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const clickTimeline = useRef<gsap.core.Timeline | null>(null);
  const trailPoints = useRef<Array<{ x: number; y: number; alpha: number }>>([]);

  // Calculate the cursor's tip position (8,4 in the SVG coordinates)
  const getCursorTipPosition = (cursorX: number, cursorY: number) => {
    return {
      x: cursorX - 16 + 8,
      y: cursorY - 16 + 4
    };
  };

  // Handle mobile detection and mounting
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };

    checkMobile();
    setIsMounted(true);

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addListener(checkMobile);

    return () => {
      mediaQuery.removeListener(checkMobile);
    };
  }, []);

  // Only initialize particle system and event listeners if not mobile
  useEffect(() => {
    if (isMobile || !isMounted) return;

    const initParticleSystem = () => {
      const canvas = particleCanvas.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw trail
        ctx.globalCompositeOperation = 'lighter';
        trailPoints.current.forEach((point, index) => {
          const alpha = point.alpha * (1 - index / trailPoints.current.length);
          ctx.fillStyle = `${resolvedTheme === 'dark' ? '#00f3ff' : '#2f80ed'}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2 * alpha, 0, Math.PI * 2);
          ctx.fill();
        });
        
        // Draw particles with proper blending
        particles.current = particles.current.filter((p) => {
          // Update particle physics with velocity damping
          p.vx *= 0.95;
          p.vy *= 0.95;
          p.x += p.vx;
          p.y += p.vy;
          p.life -= p.decay;
          p.rotation += p.rotationSpeed;
          
          if (p.life > 0) {
            const alpha = p.life * 0.8;
            ctx.fillStyle = `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.beginPath();
            ctx.moveTo(-p.size, 0);
            ctx.lineTo(p.size, 0);
            ctx.strokeStyle = `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = p.size * 0.5;
            ctx.stroke();
            ctx.restore();
            return true;
          }
          return false;
        });
        
        rafId.current = requestAnimationFrame(render);
      };
      render();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }
      };
    };

    initParticleSystem();
  }, [resolvedTheme, isMobile, isMounted]);

  // Only add mouse event listeners if not mobile
  useEffect(() => {
    if (isMobile || !isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      const velocity = {
        x: e.clientX - lastPos.current.x,
        y: e.clientY - lastPos.current.y
      };
      
      const speed = Math.hypot(velocity.x, velocity.y);
      const tipPosition = getCursorTipPosition(e.clientX, e.clientY);
      
      // Update trail points
      trailPoints.current.push({
        x: tipPosition.x,
        y: tipPosition.y,
        alpha: Math.min(speed * 0.1, 1)
      });
      
      // Limit trail length
      if (trailPoints.current.length > 20) {
        trailPoints.current.shift();
      }
      
      // Update cursor state
      setCursorState(prev => ({
        ...prev,
        position: { x: e.clientX, y: e.clientY },
        velocity,
        particleCount: Math.min(speed * 0.3, 30),
        speed: Math.min(speed * 0.1, 1)
      }));
      
      // Add particles at the cursor tip
      if (speed > 2) {
        const particleCount = Math.floor(speed * 0.2);
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount;
          particles.current.push({
            x: tipPosition.x,
            y: tipPosition.y,
            vx: Math.cos(angle) * speed * 0.1 + (Math.random() - 0.5) * 2,
            vy: Math.sin(angle) * speed * 0.1 + (Math.random() - 0.5) * 2,
            size: Math.random() * 2 + 1,
            life: Math.random() * 0.5 + 0.5,
            decay: 0.02 + Math.random() * 0.01,
            color: resolvedTheme === 'dark' 
              ? `hsl(${Math.random() * 40 + 180}, 100%, 70%)`
              : `hsl(${Math.random() * 40 + 200}, 80%, 60%)`,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
          });
        }
      }
      
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = (e: MouseEvent) => {
      const tipPosition = getCursorTipPosition(e.clientX, e.clientY);
      
      setCursorState(prev => ({
        ...prev,
        clickPosition: tipPosition,
        clickProgress: 0
      }));

      // Create click effect particles
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15;
        particles.current.push({
          x: tipPosition.x,
          y: tipPosition.y,
          vx: Math.cos(angle) * 8,
          vy: Math.sin(angle) * 8,
          size: Math.random() * 3 + 2,
          life: 1,
          decay: 0.03,
          color: resolvedTheme === 'dark' 
            ? `hsl(${Math.random() * 20 + 180}, 100%, 70%)`
            : `hsl(${Math.random() * 20 + 200}, 100%, 60%)`,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3
        });
      }

      // GSAP click animation
      if (clickTimeline.current) clickTimeline.current.kill();
      clickTimeline.current = gsap.timeline()
        .to(cursorState, {
          clickProgress: 1,
          duration: 0.2,
          ease: 'power2.out'
        })
        .to(cursorState, {
          clickProgress: 0,
          duration: 0.4,
          ease: 'power2.in'
        });
    };

    const handleMouseUp = () => {
      setCursorState(prev => ({ ...prev, clickProgress: 0 }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (clickTimeline.current) clickTimeline.current.kill();
    };
  }, [resolvedTheme, isMobile, isMounted]);

  // Don't render anything until mounted and if on mobile
  if (!isMounted || isMobile) {
    return null;
  }

  const cursorTipPosition = getCursorTipPosition(
    cursorState.position.x,
    cursorState.position.y
  );

  return (
    <>
      <canvas
        ref={particleCanvas}
        className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
      />
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: cursorState.position.x,
          top: cursorState.position.y,
          transform: `
            translate(-16px, -16px)
            scale(${1 + Math.min(Math.hypot(cursorState.velocity.x, cursorState.velocity.y) * 0.005, 0.2)})
            rotate(${Math.atan2(cursorState.velocity.y, cursorState.velocity.x) * 0.1}rad)
          `,
          filter: `drop-shadow(0 0 ${10 + cursorState.speed * 10}px ${resolvedTheme === 'dark' ? '#00f3ff' : '#2f80ed'})`,
          transition: 'transform 0.05s linear'
        }}
      >
        <CursorCore
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          cursorVariant={cursorState.variant}
          clickProgress={cursorState.clickProgress}
          speed={cursorState.speed}
        />
      </div>
      
      <div
        className="fixed w-1 h-1 pointer-events-none opacity-0 z-[9998]"
        style={{
          left: cursorTipPosition.x,
          top: cursorTipPosition.y,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      <style jsx global>{`
        ${!isMobile ? `
          * {
            cursor: none !important;
            caret-color: ${resolvedTheme === 'dark' ? '#00f3ff' : '#2f80ed'};
          }

          button, a, [data-interactive] {
            position: relative;
            transition: transform 0.2s ease;
            
            &::after {
              content: '';
              position: absolute;
              inset: -4px;
              border: 1px solid ${resolvedTheme === 'dark' ? '#00f3ff33' : '#2f80ed33'};
              border-radius: 8px;
              opacity: 0;
              transition: opacity 0.2s ease;
            }
            
            &:hover::after {
              opacity: 1;
            }
          }
        ` : ''}

        @keyframes hologram-pulse {
          0%, 100% { filter: drop-shadow(0 0 10px ${resolvedTheme === 'dark' ? '#00f3ff' : '#2f80ed'}); }
          50% { filter: drop-shadow(0 0 15px ${resolvedTheme === 'dark' ? '#00f3ff' : '#2f80ed'}); }
        }
      `}</style>
    </>
  );
};