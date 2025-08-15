// Smart Search Utility for AI-powered natural language queries
import axios from 'axios';

// Enhanced keyword mapping for natural language processing
const keywordMappings = {
  // Nature & Landscapes
  'sunset': ['sunset', 'golden hour', 'dusk', 'evening sky'],
  'sunrise': ['sunrise', 'dawn', 'morning light', 'early morning'],
  'ocean': ['ocean', 'sea', 'waves', 'beach', 'coastal'],
  'mountain': ['mountain', 'peak', 'summit', 'alpine', 'hills'],
  'forest': ['forest', 'trees', 'woods', 'jungle', 'nature'],
  'desert': ['desert', 'sand', 'dunes', 'arid', 'dry'],
  'lake': ['lake', 'pond', 'water', 'reflection', 'calm'],
  'river': ['river', 'stream', 'flowing water', 'creek'],
  'waterfall': ['waterfall', 'cascade', 'falls', 'rushing water'],
  'sky': ['sky', 'clouds', 'atmosphere', 'heavens'],
  
  // Colors
  'blue': ['blue', 'azure', 'navy', 'cobalt', 'cerulean'],
  'red': ['red', 'crimson', 'scarlet', 'ruby', 'cherry'],
  'green': ['green', 'emerald', 'jade', 'forest green', 'lime'],
  'yellow': ['yellow', 'golden', 'amber', 'sunshine', 'lemon'],
  'purple': ['purple', 'violet', 'lavender', 'plum', 'magenta'],
  'orange': ['orange', 'tangerine', 'coral', 'peach', 'amber'],
  'pink': ['pink', 'rose', 'blush', 'salmon', 'fuchsia'],
  'black': ['black', 'dark', 'shadow', 'night', 'ebony'],
  'white': ['white', 'bright', 'snow', 'pure', 'clean'],
  
  // Moods & Atmospheres
  'peaceful': ['peaceful', 'calm', 'serene', 'tranquil', 'quiet'],
  'dramatic': ['dramatic', 'intense', 'powerful', 'striking', 'bold'],
  'mysterious': ['mysterious', 'dark', 'moody', 'enigmatic', 'shadowy'],
  'bright': ['bright', 'vibrant', 'colorful', 'vivid', 'luminous'],
  'soft': ['soft', 'gentle', 'delicate', 'subtle', 'muted'],
  
  // Architecture & Urban
  'city': ['city', 'urban', 'skyline', 'buildings', 'metropolitan'],
  'building': ['building', 'architecture', 'structure', 'tower'],
  'street': ['street', 'road', 'path', 'alley', 'avenue'],
  'bridge': ['bridge', 'crossing', 'span', 'overpass'],
  
  // People & Lifestyle
  'person': ['person', 'people', 'human', 'individual', 'portrait'],
  'travel': ['travel', 'journey', 'adventure', 'exploration', 'trip'],
  'food': ['food', 'cuisine', 'meal', 'dish', 'cooking'],
  'art': ['art', 'artistic', 'creative', 'painting', 'sculpture'],
  
  // Animals
  'bird': ['bird', 'flying', 'wings', 'feathers', 'avian'],
  'cat': ['cat', 'feline', 'kitten', 'pet'],
  'dog': ['dog', 'canine', 'puppy', 'pet'],
  'wildlife': ['wildlife', 'animal', 'wild', 'nature', 'fauna'],
  
  // Weather & Seasons
  'rain': ['rain', 'storm', 'wet', 'drops', 'precipitation'],
  'snow': ['snow', 'winter', 'cold', 'frost', 'ice'],
  'spring': ['spring', 'bloom', 'flowers', 'fresh', 'growth'],
  'summer': ['summer', 'warm', 'sunny', 'hot', 'vacation'],
  'autumn': ['autumn', 'fall', 'leaves', 'harvest', 'golden'],
  'winter': ['winter', 'cold', 'snow', 'ice', 'frozen']
};

// Color extraction keywords for filtering
const colorKeywords = {
  'blue': '#0066cc',
  'red': '#cc0000', 
  'green': '#00cc00',
  'yellow': '#cccc00',
  'purple': '#6600cc',
  'orange': '#cc6600',
  'pink': '#cc0066',
  'black': '#000000',
  'white': '#ffffff'
};

class SmartSearch {
  constructor() {
    this.searchHistory = [];
    this.popularQueries = [];
  }

  // Process natural language query into search terms
  processNaturalLanguage(query) {
    const lowercaseQuery = query.toLowerCase();
    const words = lowercaseQuery.split(/\s+/);
    const enhancedTerms = new Set();
    
    // Add original query
    enhancedTerms.add(query);
    
    // Process each word through keyword mappings
    words.forEach(word => {
      // Direct mapping
      if (keywordMappings[word]) {
        keywordMappings[word].forEach(term => enhancedTerms.add(term));
      }
      
      // Partial matching for compound words
      Object.keys(keywordMappings).forEach(key => {
        if (word.includes(key) || key.includes(word)) {
          keywordMappings[key].forEach(term => enhancedTerms.add(term));
        }
      });
    });
    
    return Array.from(enhancedTerms);
  }

  // Extract dominant color preference from query
  extractColorPreference(query) {
    const lowercaseQuery = query.toLowerCase();
    const detectedColors = [];
    
    Object.keys(colorKeywords).forEach(color => {
      if (lowercaseQuery.includes(color)) {
        detectedColors.push({
          name: color,
          hex: colorKeywords[color]
        });
      }
    });
    
    return detectedColors;
  }

  // Generate search suggestions based on partial input
  generateSuggestions(partialQuery) {
    const suggestions = [];
    const lowercaseQuery = partialQuery.toLowerCase();
    
    // Template suggestions
    const templates = [
      `${partialQuery} at sunset`,
      `${partialQuery} in nature`,
      `beautiful ${partialQuery}`,
      `${partialQuery} landscape`,
      `${partialQuery} photography`,
      `colorful ${partialQuery}`,
      `peaceful ${partialQuery}`,
      `dramatic ${partialQuery}`
    ];
    
    // Add relevant templates based on query content
    templates.forEach(template => {
      if (template.length > partialQuery.length + 3) {
        suggestions.push(template);
      }
    });
    
    // Add popular related searches
    Object.keys(keywordMappings).forEach(key => {
      if (key.includes(lowercaseQuery) && key !== lowercaseQuery) {
        suggestions.push(key);
        keywordMappings[key].slice(0, 2).forEach(related => {
          suggestions.push(related);
        });
      }
    });
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }

  // Enhanced search with multiple strategies
  async performSmartSearch(query, apiKey, options = {}) {
    const {
      perPage = 20,
      page = 1,
      orientation = 'all',
      category = 'all'
    } = options;

    try {
      // Process the natural language query
      const enhancedTerms = this.processNaturalLanguage(query);
      const colorPreferences = this.extractColorPreference(query);
      
      // Try multiple search strategies
      const searchStrategies = [
        // Primary search with original query
        { query: query, weight: 1.0 },
        // Enhanced terms search
        { query: enhancedTerms.slice(0, 3).join(' OR '), weight: 0.8 },
        // Fallback with most relevant single term
        { query: enhancedTerms[1] || query, weight: 0.6 }
      ];

      let allResults = [];
      
      for (const strategy of searchStrategies) {
        try {
          const response = await axios.get('https://api.unsplash.com/search/photos', {
            headers: {
              Authorization: `Client-ID ${apiKey}`
            },
            params: {
              query: strategy.query,
              per_page: Math.ceil(perPage / searchStrategies.length),
              page: page,
              orientation: orientation !== 'all' ? orientation : undefined,
              category: category !== 'all' ? category : undefined,
              order_by: 'relevance'
            }
          });

          const results = response.data.results.map(result => ({
            ...result,
            searchWeight: strategy.weight,
            matchedTerms: enhancedTerms.filter(term => 
              result.description?.toLowerCase().includes(term.toLowerCase()) ||
              result.alt_description?.toLowerCase().includes(term.toLowerCase()) ||
              result.tags?.some(tag => tag.title.toLowerCase().includes(term.toLowerCase()))
            )
          }));

          allResults = allResults.concat(results);
        } catch (strategyError) {
          console.warn(`Search strategy failed: ${strategy.query}`, strategyError);
        }
      }

      // Remove duplicates and sort by relevance
      const uniqueResults = this.removeDuplicates(allResults);
      const sortedResults = this.sortByRelevance(uniqueResults, query, colorPreferences);
      
      // Store search history
      this.addToHistory(query, sortedResults.length);
      
      return {
        results: sortedResults.slice(0, perPage),
        total: sortedResults.length,
        enhancedTerms: enhancedTerms,
        colorPreferences: colorPreferences,
        searchStrategies: searchStrategies.map(s => s.query)
      };

    } catch (error) {
      console.error('Smart search failed:', error);
      throw error;
    }
  }

  // Remove duplicate results based on ID
  removeDuplicates(results) {
    const seen = new Set();
    return results.filter(result => {
      if (seen.has(result.id)) {
        return false;
      }
      seen.add(result.id);
      return true;
    });
  }

  // Sort results by relevance score
  sortByRelevance(results, originalQuery, colorPreferences) {
    return results.sort((a, b) => {
      let scoreA = a.searchWeight || 0;
      let scoreB = b.searchWeight || 0;
      
      // Boost score for matched terms
      scoreA += (a.matchedTerms?.length || 0) * 0.1;
      scoreB += (b.matchedTerms?.length || 0) * 0.1;
      
      // Boost score for color preferences
      if (colorPreferences.length > 0) {
        // This would require color analysis of the image
        // For now, boost based on description matching
        colorPreferences.forEach(color => {
          if (a.description?.toLowerCase().includes(color.name) || 
              a.alt_description?.toLowerCase().includes(color.name)) {
            scoreA += 0.2;
          }
          if (b.description?.toLowerCase().includes(color.name) || 
              b.alt_description?.toLowerCase().includes(color.name)) {
            scoreB += 0.2;
          }
        });
      }
      
      // Boost score for higher quality images
      scoreA += (a.likes || 0) * 0.0001;
      scoreB += (b.likes || 0) * 0.0001;
      
      return scoreB - scoreA;
    });
  }

  // Add search to history
  addToHistory(query, resultCount) {
    this.searchHistory.unshift({
      query,
      resultCount,
      timestamp: new Date(),
      id: Date.now()
    });
    
    // Keep only last 50 searches
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(0, 50);
    }
  }

  // Get search history
  getSearchHistory() {
    return this.searchHistory;
  }

  // Get popular search terms
  getPopularSearches() {
    const termCounts = {};
    
    this.searchHistory.forEach(search => {
      const terms = search.query.toLowerCase().split(/\s+/);
      terms.forEach(term => {
        if (term.length > 2) { // Ignore very short terms
          termCounts[term] = (termCounts[term] || 0) + 1;
        }
      });
    });
    
    return Object.entries(termCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));
  }
}

export default SmartSearch;
