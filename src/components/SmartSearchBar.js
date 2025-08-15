import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  processNaturalLanguageQuery, 
  getSearchSuggestions, 
  saveSearchQuery,
  getSearchHistory 
} from '../utils/smartSearch';
import './SmartSearchBar.css';

const SmartSearchBar = ({ 
  onSearch, 
  isLightMode, 
  isBiggerScreen, 
  initialQuery = '' 
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setSearchHistory(getSearchHistory().slice(0, 5));
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const newSuggestions = getSearchSuggestions(query);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions(searchHistory.map(h => h.query));
    }
  }, [query, searchHistory]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedSuggestion(-1);
    
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    setIsProcessing(true);
    setShowSuggestions(false);
    
    try {
      const processedQuery = processNaturalLanguageQuery(searchQuery);
      await onSearch(searchQuery, processedQuery);
      saveSearchQuery(searchQuery, []);
      setSearchHistory(getSearchHistory().slice(0, 5));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestion]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
      default:
        break;
    }
  };

  const handleFocus = () => {
    if (query.length > 0 || searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget)) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    }, 150);
  };

  return (
    <div className="smart-search-container">
      <motion.div 
        className="search-input-wrapper"
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <motion.input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Try 'sunset over mountains' or 'peaceful nature'..."
          className={`smart-search-input ${isLightMode ? 'light' : 'dark'}`}
          style={{
            width: isBiggerScreen ? '350px' : '280px',
            height: '42px',
            backgroundColor: isLightMode ? 'rgb(240,240,240)' : 'rgb(60,60,60)',
            color: isLightMode ? 'black' : 'white',
            border: `2px solid ${isLightMode ? 'rgb(200,200,200)' : 'rgb(80,80,80)'}`,
            borderRadius: '12px',
            paddingLeft: '16px',
            paddingRight: '50px',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          whileFocus={{
            borderColor: isLightMode ? '#0971f1' : '#4dabf7',
            boxShadow: `0 0 0 3px ${isLightMode ? 'rgba(9,113,241,0.1)' : 'rgba(77,171,247,0.1)'}`
          }}
        />
        
        <motion.button
          onClick={() => handleSearch()}
          className="search-button"
          disabled={isProcessing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: isLightMode ? '#0971f1' : '#4dabf7',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%' }}
            />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          )}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            className="suggestions-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: isLightMode ? 'white' : 'rgb(40,40,40)',
              border: `1px solid ${isLightMode ? 'rgb(220,220,220)' : 'rgb(80,80,80)'}`,
              borderRadius: '12px',
              marginTop: '4px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion}
                className={`suggestion-item ${selectedSuggestion === index ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(suggestion)}
                whileHover={{ backgroundColor: isLightMode ? 'rgb(248,249,250)' : 'rgb(50,50,50)' }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: index < suggestions.length - 1 ? `1px solid ${isLightMode ? 'rgb(240,240,240)' : 'rgb(60,60,60)'}` : 'none',
                  color: isLightMode ? 'rgb(60,60,60)' : 'rgb(200,200,200)',
                  fontSize: '14px',
                  backgroundColor: selectedSuggestion === index ? (isLightMode ? 'rgb(248,249,250)' : 'rgb(50,50,50)') : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  {suggestion}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearchBar;
