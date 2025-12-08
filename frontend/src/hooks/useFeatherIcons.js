import { useEffect } from 'react';

/**
 * Custom hook to safely initialize Feather Icons
 * Prevents React DOM conflicts by using requestAnimationFrame and error handling
 * 
 * @param {Array} dependencies - Array of dependencies to trigger icon replacement
 * @param {number} delay - Delay in milliseconds before replacing icons (default: 150)
 */
export const useFeatherIcons = (dependencies = [], delay = 150) => {
  useEffect(() => {
    let timeoutId = null;
    let rafId = null;
    let isMounted = true;

    const replaceIcons = () => {
      // Only replace if component is still mounted
      if (!isMounted) return;
      
      try {
        if (window.feather) {
          window.feather.replace();
        }
      } catch (error) {
        // Silently fail - icons will just not be replaced
        console.warn('Feather icons replace failed:', error);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    // Then add additional delay to avoid conflicts with React rendering
    rafId = requestAnimationFrame(() => {
      if (isMounted) {
        timeoutId = setTimeout(replaceIcons, delay);
      }
    });
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, dependencies);
};

export default useFeatherIcons;
