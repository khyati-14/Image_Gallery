import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import './FullscreenModal.css';

const FullscreenModal = ({ 
  isOpen, 
  onClose, 
  image, 
  images = [], 
  currentIndex = 0, 
  onNavigate 
}) => {
  const [dominantColor, setDominantColor] = useState('#000000');
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const canvasRef = useRef(null);
  const timeoutRef = useRef(null);

  // Extract dominant color from image
  useEffect(() => {
    if (!image?.src) return;

    const extractDominantColor = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        
        try {
          const imageData = ctx.getImageData(0, 0, 50, 50);
          const data = imageData.data;
          let r = 0, g = 0, b = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
          
          const pixelCount = data.length / 4;
          r = Math.floor(r / pixelCount);
          g = Math.floor(g / pixelCount);
          b = Math.floor(b / pixelCount);
          
          setDominantColor(`rgb(${r}, ${g}, ${b})`);
        } catch (error) {
          console.log('Color extraction failed:', error);
          setDominantColor('#333333');
        }
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setDominantColor('#333333');
        setIsLoading(false);
      };
      
      img.src = image.src.small || image.src.regular;
    };

    if (isOpen) {
      extractDominantColor();
    }
  }, [image, isOpen]);

  // Auto-hide controls
  useEffect(() => {
    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowControls(true);
      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    if (isOpen) {
      resetTimeout();
      const handleMouseMove = () => resetTimeout();
      document.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || !image) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        className="fullscreen-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{
          background: `radial-gradient(ellipse at center, ${dominantColor}15 0%, ${dominantColor}08 50%, #00000090 100%)`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Background blur effect */}
        <div 
          className="modal-background-blur"
          style={{
            backgroundImage: `url(${image.src.small})`,
            filter: 'blur(40px) brightness(0.3)',
          }}
        />

        {/* Main content */}
        <motion.div
          className="modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <motion.img
            src={image.src.regular || image.src.full}
            alt={image.alt}
            className="modal-image"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              boxShadow: `0 25px 50px ${dominantColor}40, 0 0 0 1px ${dominantColor}20`,
            }}
          />

          {/* Image info */}
          <motion.div
            className="image-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showControls ? 1 : 0, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="image-details">
              <h3>{image.alt || 'Untitled'}</h3>
              <p>by {image.user?.name || 'Unknown'}</p>
              <div className="image-stats">
                <span>❤️ {image.likes}</span>
                <span>📷 {image.user?.total_photos || 0} photos</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Controls */}
        <AnimatePresence>
          {showControls && (
            <>
              {/* Close button */}
              <motion.button
                className="modal-control close-button"
                onClick={onClose}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: `${dominantColor}20`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${dominantColor}30`,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </motion.button>

              {/* Previous button */}
              {currentIndex > 0 && (
                <motion.button
                  className="modal-control prev-button"
                  onClick={() => onNavigate(currentIndex - 1)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: `${dominantColor}20`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${dominantColor}30`,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </motion.button>
              )}

              {/* Next button */}
              {currentIndex < images.length - 1 && (
                <motion.button
                  className="modal-control next-button"
                  onClick={() => onNavigate(currentIndex + 1)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: `${dominantColor}20`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${dominantColor}30`,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </motion.button>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <motion.div
                  className="image-counter"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  style={{
                    background: `${dominantColor}20`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${dominantColor}30`,
                  }}
                >
                  {currentIndex + 1} / {images.length}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default FullscreenModal;
