'use client';

import { useState, useEffect } from 'react';

export default function BackgroundParticles() {
  const [particles, setParticles] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const newParticles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 80 + 30}px`,
        height: `${Math.random() * 80 + 30}px`,
        animationDuration: `${Math.random() * 10 + 20}s`,
        animationDelay: `${Math.random() * 5}s`
      }));
      
      setParticles(newParticles);
    }
  }, [isClient]);

  if (!isClient) return null;

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-white opacity-10 rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.width,
            height: particle.height,
            animation: `float ${particle.animationDuration} linear infinite`,
            animationDelay: particle.animationDelay
          }}
        ></div>
      ))}
    </div>
  );
}