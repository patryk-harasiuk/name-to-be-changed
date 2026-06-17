import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface PresentationViewerProps {
  slides: string[];
}

export default function PresentationViewer({ slides }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      }
      if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);


  const slideVariants: Variants = {
    initial: { opacity: 0, scale: 0.9, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 1.1, y: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="viewer-container">
      <div className="progress-bar" style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="slide-content"
          dangerouslySetInnerHTML={{ __html: slides[currentSlide] }}
        />
      </AnimatePresence>
    </div>
  );
}