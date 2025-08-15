import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { motion } from 'framer-motion';
import Cards from './cards';
import './VirtualizedGrid.css';

const VirtualizedGrid = ({ 
  images, 
  onLoadMore, 
  hasNextPage, 
  isLoading,
  onImageClick,
  containerWidth = 1200 
}) => {
  const [dimensions, setDimensions] = useState({
    columnCount: 4,
    columnWidth: 300,
    rowHeight: 380
  });
  
  const gridRef = useRef();
  const containerRef = useRef();

  // Calculate grid dimensions based on container width
  useEffect(() => {
    const calculateDimensions = () => {
      const containerWidth = containerRef.current?.offsetWidth || 1200;
      const cardWidth = 280;
      const gap = 20;
      const minColumns = 1;
      const maxColumns = 6;
      
      let columnCount = Math.floor((containerWidth + gap) / (cardWidth + gap));
      columnCount = Math.max(minColumns, Math.min(maxColumns, columnCount));
      
      const totalGapWidth = (columnCount - 1) * gap;
      const availableWidth = containerWidth - totalGapWidth;
      const columnWidth = Math.floor(availableWidth / columnCount);
      
      setDimensions({
        columnCount,
        columnWidth: Math.max(columnWidth, 250),
        rowHeight: 380
      });
    };

    calculateDimensions();
    
    const handleResize = () => {
      setTimeout(calculateDimensions, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate total rows needed
  const rowCount = Math.ceil(images.length / dimensions.columnCount);

  // Infinite scroll detection
  const handleScroll = useCallback(({ scrollTop, scrollHeight, clientHeight }) => {
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage > 0.8 && hasNextPage && !isLoading) {
      onLoadMore();
    }
  }, [hasNextPage, isLoading, onLoadMore]);

  // Cell renderer for react-window
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const itemIndex = rowIndex * dimensions.columnCount + columnIndex;
    const image = images[itemIndex];
    
    if (!image) {
      // Loading placeholder
      if (itemIndex < images.length + dimensions.columnCount && isLoading) {
        return (
          <div style={style}>
            <div className="loading-card">
              <motion.div
                className="loading-shimmer"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </div>
          </div>
        );
      }
      return null;
    }

    return (
      <div style={style}>
        <div className="grid-cell">
          <Cards
            id={image.id}
            src={image.srcs}
            alt={image.alt}
            likes={image.likes}
            user={image.user}
            index={itemIndex}
            onClick={() => onImageClick(itemIndex)}
          />
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="virtualized-grid-container">
      <Grid
        ref={gridRef}
        className="virtualized-grid"
        columnCount={dimensions.columnCount}
        columnWidth={dimensions.columnWidth}
        height={600} // Fixed height for virtualization
        rowCount={rowCount}
        rowHeight={dimensions.rowHeight}
        onScroll={handleScroll}
        overscanRowCount={2}
        style={{
          width: '100%',
          height: '80vh'
        }}
      >
        {Cell}
      </Grid>
      
      {/* Loading indicator */}
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
    </div>
  );
};

export default VirtualizedGrid;
