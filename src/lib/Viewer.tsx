import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { parseToCanvas } from './parser';

interface ViewerProps {
  markdown: string;
}

export const Viewer = ({ markdown }: ViewerProps) => {
  const [currentPanel, setCurrentPanel] = useState<number>(0);
  const [cameraY, setCameraY] = useState<number>(0);
  
  const canvasRef = useRef<HTMLDivElement>(null);


  const htmlContent = parseToCanvas(markdown);


  useEffect(() => {
    const panelsCount = (htmlContent.match(/class="marvel-panel"/g) || []).length;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentPanel((prev) => Math.min(prev + 1, panelsCount - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentPanel((prev) => Math.max(prev - 0, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [htmlContent]);

  // 3. Efekt Kamery - Obliczanie pozycji wybranego panelu
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Szukamy elementu DOM o id="panel-X"
    const activePanelElement = canvasRef.current.querySelector(`#panel-${currentPanel}`) as HTMLElement;
    
    if (activePanelElement) {
      const yOffset = activePanelElement.offsetTop;
      setCameraY(-yOffset + 40); 
    }
  }, [currentPanel, htmlContent]);

  return (
    <div 
      className="marvel-viewport" 
      style={{ 
        height: '80vh', 
        overflow: 'hidden', 
        position: 'relative',
        background: '#1a1a1a',
        borderRadius: '12px'
      }}
    >
      <motion.div
        ref={canvasRef}
        className="marvel-canvas"
      
        animate={{ y: cameraY }}
        transition={{ type: 'spring', damping: 20, stiffness: 90 }}
        style={{ padding: '40px' }}
      >
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </motion.div>
    </div>
  );
};