import { useState, useEffect } from 'react';

export function useViewportHeight() {
  const getHeight = () => {
    if (window.visualViewport) {
      return window.visualViewport.height; // 모바일에서도 정확
    }
    return window.innerHeight; // fallback
  };

  const [height, setHeight] = useState(getHeight);

  useEffect(() => {
    const handleResize = () => setHeight(getHeight());

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return height;
}
