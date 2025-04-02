'use client';

import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

interface MouseState {
  x: number | null;
  y: number | null;
  elementX: number | null;
  elementY: number | null;
  elementPositionX: number | null;
  elementPositionY: number | null;
}

export function useMouse(): [MouseState, RefObject<HTMLDivElement>] {
  const [state, setState] = useState<MouseState>({
    x: null,
    y: null,
    elementX: null,
    elementY: null,
    elementPositionX: null,
    elementPositionY: null,
  });

  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const newState: Partial<MouseState> = {
        x: event.pageX,
        y: event.pageY,
      };

      if (ref.current instanceof Element) {
        const { left, top } = ref.current.getBoundingClientRect();
        const elementPositionX = left + window.scrollX;
        const elementPositionY = top + window.scrollY;
        const elementX = event.pageX - elementPositionX;
        const elementY = event.pageY - elementPositionY;

        newState.elementX = elementX;
        newState.elementY = elementY;
        newState.elementPositionX = elementPositionX;
        newState.elementPositionY = elementPositionY;
      }

      setState((s) => ({
        ...s,
        ...newState,
      }));
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return [state, ref];
}

// Fluid cursor implementation
export function useFluidCursor() {
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameRef = useRef<number>();

  useLayoutEffect(() => {
    const canvas = document.getElementById('fluid');
    if (!canvas) return;

    // Initialize WebGL context
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    glRef.current = gl;

    // Set up canvas size
    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * pixelRatio;
      canvas.height = canvas.clientHeight * pixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize fluid simulation
    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1440,
      CAPTURE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 3.5,
      VELOCITY_DISSIPATION: 2,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 20,
      CURL: 3,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLOR_UPDATE_SPEED: 10,
      PAUSED: false,
      BACK_COLOR: { r: 0.5, g: 0, b: 0 },
      TRANSPARENT: true,
    };

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      // Add fluid effect at mouse position
      addSplat(x, y, e.movementX, e.movementY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      // Add stronger fluid effect on click
      addSplat(x, y, 0, 0, true);
    };

    // Add fluid effect
    const addSplat = (x: number, y: number, dx: number, dy: number, isClick: boolean = false) => {
      if (!glRef.current || !programRef.current) return;

      const gl = glRef.current;
      const program = programRef.current;
      const color = generateColor();
      const force = isClick ? 30 : Math.sqrt(dx * dx + dy * dy) * 0.5;
      
      // Add fluid simulation code here
      // This is a simplified version - you'll need to implement the full fluid simulation
      gl.uniform2f(gl.getUniformLocation(program, 'uPoint'), x, y);
      gl.uniform3f(gl.getUniformLocation(program, 'uColor'), color.r, color.g, color.b);
      gl.uniform1f(gl.getUniformLocation(program, 'uForce'), force);
      
      // Render fluid effect
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // Generate random color
    const generateColor = () => {
      return {
        r: Math.random() * 0.5 + 0.5,
        g: Math.random() * 0.5 + 0.5,
        b: Math.random() * 0.5 + 0.5,
      };
    };

    // Animation loop
    const animate = () => {
      // Update fluid simulation
      updateFluid();
      
      // Render frame
      render();
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (glRef.current) {
        glRef.current.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  }, []);

  // Helper functions for fluid simulation
  const updateFluid = () => {
    // Implement fluid simulation update logic here
  };

  const render = () => {
    // Implement rendering logic here
  };
} 