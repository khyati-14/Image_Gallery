import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chip, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';
import ColorLensIcon from '@mui/icons-material/ColorLens';

const SmartSearchBar = ({ 
  onSearch, 
  isLightMode, 
  isBiggerScreen, 
  smartSearch,
  searchQuery,
  setSearchQuery 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSmartMode, setIsSmartMode] = useState(true);
  const [detectedColors, setDetectedColors] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Example smart search suggestions
  const smartSuggestions = [
    "sunset over mountains",
    "peaceful lake reflection", 
    "vibrant city lights at night",
    "colorful autumn forest",
    "dramatic storm clouds",
    "serene beach waves",
    "golden hour landscape",
    "mysterious foggy forest"
  ];

  useEffect(() => {
    if (smartSearch) {
      setSearchHistory(smartSearch.getSearchHistory().slice(0, 5));
    }
  }, [smartSearch]);

  useEffect(() => {
    if (searchQuery.length > 2 && isSmartMode) {
      const colors = smartSearch?.extractColorPreference(searchQuery) || [];
      setDetectedColors(colors);
      
      if (smartSearch) {
        const newSuggestions = smartSearch.generateSuggestions(searchQuery);
        setSuggestions(newSuggestions);
      } else {
        // Fallback suggestions
        const filtered = smartSuggestions.filter(s => 
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions(filtered);
      }
    } else {
      setSuggestions([]);
      setDetectedColors([]);
    }
  }, [searchQuery, isSmartMode, smartSearch]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    if (searchQuery.length > 2 || searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div className="search-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <motion.div 
          className="search-input-wrapper"
          style={{ 
            position: 'relative', 
            flex: 1,
            display: 'flex',
            alignItems: 'center'
          }}
          whileFocus={{ scale: 1.02 }}
        >
          <motion.input
            ref={inputRef}
            style={{
              width: '100%',
              height: '42px',
              backgroundColor: isLightMode ? 'rgb(240,240,240)' : 'rgb(60,60,60)',
              color: isLightMode ? 'black' : 'white',
              borderRadius: '21px',
              border: `2px solid ${isSmartMode ? '#4CAF50' : 'transparent'}`,
              paddingLeft: '20px',
              paddingRight: '50px',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxShadow: isSmartMode ? '0 0 10px rgba(76, 175, 80, 0.3)' : 'none'
            }}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isSmartMode ? "Try: 'sunset over mountains' or 'peaceful blue lake'" : "Search images..."}
            whileFocus={{ 
              boxShadow: isSmartMode 
                ? "0 0 20px rgba(76, 175, 80, 0.5)" 
                : "0 0 15px rgba(0,123,255,0.4)"
            }}
          />
          
          <IconButton
            onClick={handleSearch}
            style={{
              position: 'absolute',
              right: '5px',
              color: isLightMode ? '#666' : '#ccc'
            }}
            size="small"
          >
            <SearchIcon />
          </IconButton>
        </motion.div>

        <Tooltip title={isSmartMode ? "Smart AI Search Active" : "Enable Smart Search"}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconButton
              onClick={() => setIsSmartMode(!isSmartMode)}
              style={{
                color: isSmartMode ? '#4CAF50' : (isLightMode ? '#666' : '#ccc'),
                backgroundColor: isSmartMode ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
              }}
            >
              <AutoAwesomeIcon />
            </IconButton>
          </motion.div>
        </Tooltip>
      </div>

      {/* Color Detection Chips */}
      <AnimatePresence>
        {detectedColors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              display: 'flex',
              gap: '6px',
              marginTop: '8px',
              alignItems: 'center'
            }}
          >
            <ColorLensIcon style={{ fontSize: '16px', color: '#666' }} />
            {detectedColors.map((color, idx) => (
              <Chip
                key={idx}
                label={color.name}
                size="small"
                style={{
                  backgroundColor: color.hex + '20',
                  color: isLightMode ? '#333' : '#fff',
                  border: `1px solid ${color.hex}`,
                  fontSize: '11px'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
          <motion.div
            ref={suggestionsRef}
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
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              border: `1px solid ${isLightMode ? '#e0e0e0' : '#555'}`,
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              marginTop: '8px'
            }}
          >
            {/* Search History */}
            {searchHistory.length > 0 && searchQuery.length === 0 && (
              <div style={{ padding: '12px 16px 8px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginBottom: '8px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <HistoryIcon style={{ fontSize: '14px' }} />
                  Recent Searches
                </div>
                {searchHistory.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ backgroundColor: isLightMode ? '#f5f5f5' : '#555' }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontSize: '14px',
                      margin: '2px 0'
                    }}
                    onClick={() => handleSuggestionClick(item.query)}
                  >
                    {item.query}
                    <span style={{ 
                      fontSize: '11px', 
                      color: '#888', 
                      marginLeft: '8px' 
                    }}>
                      {item.resultCount} results
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <div style={{ padding: '12px 16px' }}>
                {searchQuery.length > 0 && (
                  <div style={{ 
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AutoAwesomeIcon style={{ fontSize: '14px' }} />
                    Smart Suggestions
                  </div>
                )}
                {suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ 
                      backgroundColor: isLightMode ? '#f0f8ff' : '#444',
                      x: 4
                    }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontSize: '14px',
                      margin: '2px 0',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearchBar;
