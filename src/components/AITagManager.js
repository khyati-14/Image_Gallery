import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import aiVisionService from '../utils/aiVisionService';
import './AITagManager.css';

const AITagManager = ({ images, isOpen, onClose, onTagsUpdated }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedImages, setProcessedImages] = useState(0);
  const [currentImage, setCurrentImage] = useState('');
  const [results, setResults] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadAllTags();
    }
  }, [isOpen]);

  const loadAllTags = () => {
    const tags = aiVisionService.getAllTags();
    setAllTags(tags);
  };

  const processImages = async () => {
    if (!images || images.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessedImages(0);
    setResults([]);

    const newResults = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      setCurrentImage(image.alt_description || `Image ${i + 1}`);

      try {
        const tags = await aiVisionService.getImageTags(
          image.id,
          image.urls.regular,
          selectedProvider
        );

        newResults.push({
          imageId: image.id,
          imageUrl: image.urls.thumb,
          alt: image.alt_description,
          tags: tags,
          status: 'success'
        });
      } catch (error) {
        console.error(`Error processing image ${image.id}:`, error);
        newResults.push({
          imageId: image.id,
          imageUrl: image.urls.thumb,
          alt: image.alt_description,
          tags: [],
          status: 'error',
          error: error.message
        });
      }

      setProcessedImages(i + 1);
      setProgress(((i + 1) / images.length) * 100);
      setResults([...newResults]);
    }

    setIsProcessing(false);
    setCurrentImage('');
    loadAllTags();
    
    if (onTagsUpdated) {
      onTagsUpdated();
    }
  };

  const clearAllTags = () => {
    if (window.confirm('Are you sure you want to clear all AI-generated tags? This action cannot be undone.')) {
      aiVisionService.clearAllTags();
      setAllTags([]);
      setResults([]);
      if (onTagsUpdated) {
        onTagsUpdated();
      }
    }
  };

  const getProviderName = (provider) => {
    switch (provider) {
      case 'google': return 'Google Vision';
      case 'azure': return 'Azure Vision';
      case 'openai': return 'OpenAI Vision';
      case 'auto': return 'Auto (Try All)';
      default: return provider;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="ai-tag-manager-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="ai-tag-manager"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ai-tag-manager-header">
            <h2>AI Tag Manager</h2>
            <div className="header-buttons">
              <button
                className="settings-btn"
                onClick={() => setShowSettings(!showSettings)}
              >
                ⚙️ Settings
              </button>
              <button className="close-btn" onClick={onClose}>
                ✕
              </button>
            </div>
          </div>

          {showSettings && (
            <motion.div
              className="settings-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="setting-group">
                <label>AI Provider:</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  disabled={isProcessing}
                >
                  <option value="auto">Auto (Try All)</option>
                  <option value="google">Google Vision</option>
                  <option value="azure">Azure Vision</option>
                  <option value="openai">OpenAI Vision</option>
                </select>
              </div>
              <div className="setting-info">
                <p>Selected: {getProviderName(selectedProvider)}</p>
                <p>Images to process: {images?.length || 0}</p>
              </div>
            </motion.div>
          )}

          <div className="ai-tag-manager-content">
            <div className="control-panel">
              <button
                className="process-btn"
                onClick={processImages}
                disabled={isProcessing || !images || images.length === 0}
              >
                {isProcessing ? 'Processing...' : 'Generate AI Tags'}
              </button>
              
              <button
                className="clear-btn"
                onClick={clearAllTags}
                disabled={isProcessing}
              >
                Clear All Tags
              </button>
            </div>

            {isProcessing && (
              <motion.div
                className="progress-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="progress-info">
                  <p>Processing: {currentImage}</p>
                  <p>{processedImages} of {images?.length || 0} images</p>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="progress-text">{Math.round(progress)}%</p>
              </motion.div>
            )}

            {allTags.length > 0 && (
              <div className="tags-overview">
                <h3>All Generated Tags ({allTags.length})</h3>
                <div className="tags-cloud">
                  {allTags.slice(0, 20).map((tag, index) => (
                    <motion.span
                      key={tag}
                      className="tag-cloud-item"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                  {allTags.length > 20 && (
                    <span className="tag-cloud-more">+{allTags.length - 20} more</span>
                  )}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="results-section">
                <h3>Processing Results</h3>
                <div className="results-grid">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.imageId}
                      className={`result-item ${result.status}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <img
                        src={result.imageUrl}
                        alt={result.alt}
                        className="result-thumbnail"
                      />
                      <div className="result-info">
                        <p className="result-status">
                          {result.status === 'success' ? '✅' : '❌'} 
                          {result.status === 'success' 
                            ? `${result.tags.length} tags generated`
                            : 'Failed'
                          }
                        </p>
                        {result.status === 'success' && result.tags.length > 0 && (
                          <div className="result-tags">
                            {result.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span key={tagIndex} className="result-tag">
                                {tag.name}
                              </span>
                            ))}
                            {result.tags.length > 3 && (
                              <span className="result-tag-more">
                                +{result.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        {result.error && (
                          <p className="result-error">{result.error}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AITagManager;
