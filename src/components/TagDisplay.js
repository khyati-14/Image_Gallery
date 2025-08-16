import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TagDisplay.css';

const TagDisplay = ({ tags, onTagClick, compact = false, maxTags = 5 }) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = showAll ? tags : tags.slice(0, maxTags);
  const hasMoreTags = tags.length > maxTags;

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'Google Vision':
        return '#4285f4';
      case 'Azure Vision':
        return '#0078d4';
      case 'OpenAI Vision':
        return '#10a37f';
      case 'Mock':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#10b981'; // green
    if (confidence >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className={`tag-display ${compact ? 'compact' : ''}`}>
      <AnimatePresence>
        {displayTags.map((tag, index) => (
          <motion.div
            key={`${tag.name}-${index}`}
            className="ai-tag"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2 }
            }}
            onClick={() => onTagClick && onTagClick(tag.name)}
            style={{
              cursor: onTagClick ? 'pointer' : 'default'
            }}
          >
            <span className="tag-name">{tag.name}</span>
            {!compact && (
              <>
                <span 
                  className="tag-confidence"
                  style={{ color: getConfidenceColor(tag.confidence) }}
                >
                  {tag.confidence}%
                </span>
                <span 
                  className="tag-provider"
                  style={{ color: getProviderColor(tag.provider) }}
                >
                  {tag.provider === 'Google Vision' ? 'G' :
                   tag.provider === 'Azure Vision' ? 'A' :
                   tag.provider === 'OpenAI Vision' ? 'O' : 'M'}
                </span>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {hasMoreTags && (
        <motion.button
          className="show-more-tags"
          onClick={() => setShowAll(!showAll)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {showAll ? `Show Less` : `+${tags.length - maxTags} more`}
        </motion.button>
      )}
    </div>
  );
};

export default TagDisplay;
