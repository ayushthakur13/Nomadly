import { useRef, useEffect, useState } from 'react';

/**
 * Manages header menu open/close state and outside-click detection.
 * Pure state + DOM listener only. No dispatch or navigation.
 */
export const useTripHeaderMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return { isMenuOpen, setIsMenuOpen, menuRef };
};
