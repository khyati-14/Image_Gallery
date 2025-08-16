import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cards from './cards';
import FullscreenModal from './FullscreenModal';
import './InfiniteScrollGrid.css';

const InfiniteScrollGrid = ({ 
  images, 
  onLoadMore, 
  hasNextPage, 
  isLoading,
  onTagClick 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
  const [showModal, setShowModal] = useState(false);
  const containerRef = useRef();
  const loadingRef = useRef();

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isLoading) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [hasNextPage, isLoading, onLoadMore]);

  const handleImageClick = useCallback((index) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setSelectedImageIndex(-1);
  }, []);

  const handleNavigate = useCallback((newIndex) => {
    if (newIndex >= 0 && newIndex < images.length) {
      setSelectedImageIndex(newIndex);
    }
  }, [images.length]);

  return (
    <div ref={containerRef} className="infinite-scroll-grid">
      <div className="grid-container">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className="grid-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: (index % 20) * 0.05 // Stagger only for batches
            }}
          >
            <Cards
              id={image.id}
              src={image.srcs}
              alt={image.alt}
              likes={image.likes}
              user={image.user}
              index={index}
              instagramUrl={image.instagramUrl}
              twitterUrl={image.twitterUrl}
              onClick={() => handleImageClick(index)}
              onTagClick={onTagClick}
            />
          </motion.div>
        ))}
      </div>

      {/* Loading indicator */}
      <div ref={loadingRef} className="loading-trigger">
        {isLoading && (
          <motion.div
            className="loading-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.div
              className="loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>Loading more images...</span>
          </motion.div>
        )}
        
        {!hasNextPage && images.length > 0 && (
          <motion.div
            className="end-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span>You've reached the end! 🎉</span>
          </motion.div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={showModal}
        onClose={handleModalClose}
        image={selectedImageIndex >= 0 ? images[selectedImageIndex] : null}
        images={images}
        currentIndex={selectedImageIndex}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default InfiniteScrollGrid;
