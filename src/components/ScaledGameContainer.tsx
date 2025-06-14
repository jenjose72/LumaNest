'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScaledGameContainer({ children }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [containerHeight, setContainerHeight] = useState('auto');
  
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const viewportHeight = window.innerHeight;
      const headerHeight = 60; // Approximate header height
      const footerHeight = 30; // Approximate footer height
      const padding = 20; // Some padding
      
      // Available height for the game
      const availableHeight = viewportHeight - headerHeight - footerHeight - padding;
      
      // Get the game's natural height
      const element = containerRef.current;
      // Reset scale temporarily to measure true size
      element.style.transform = 'scale(1)';
      const originalHeight = element.scrollHeight;
      
      if (originalHeight > availableHeight) {
        // Calculate scale to fit
        const newScale = availableHeight / originalHeight;
        setScale(Math.min(newScale, 1)); // Don't scale up, only down
        setContainerHeight(`${availableHeight}px`);
      } else {
        setScale(1);
        setContainerHeight('auto');
      }
    };
    
    // Update scale on mount and window resize
    updateScale();
    window.addEventListener('resize', updateScale);
    
    // Use ResizeObserver to detect changes in the content
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateScale);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      return () => {
        window.removeEventListener('resize', updateScale);
        resizeObserver.disconnect();
      };
    }
    
    return () => {
      window.removeEventListener('resize', updateScale);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      style={{ 
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        height: containerHeight
      }}
      className="flex flex-col lg:flex-row gap-2 w-full justify-center"
    >
      {children}
    </div>
  );
}