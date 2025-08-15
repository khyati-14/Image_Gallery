// Smart Search Utility for AI-powered natural language queries
import axios from 'axios';

// Natural language to search terms mapping
const nlpPatterns = {
  colors: {
    patterns: [
      /\b(red|crimson|scarlet|ruby|cherry)\b/gi,
      /\b(blue|azure|navy|cobalt|cerulean)\b/gi,
      /\b(green|emerald|forest|lime|mint)\b/gi,
      /\b(yellow|golden|amber|lemon|sunshine)\b/gi,
      /\b(purple|violet|lavender|plum|magenta)\b/gi,
      /\b(orange|tangerine|coral|peach|apricot)\b/gi,
      /\b(pink|rose|blush|salmon|fuchsia)\b/gi,
      /\b(black|dark|shadow|midnight|ebony)\b/gi,
      /\b(white|bright|light|snow|ivory)\b/gi,
      /\b(brown|tan|coffee|chocolate|sepia)\b/gi,
      /\b(gray|grey|silver|slate|ash)\b/gi
    ],
    keywords: [
      'red', 'blue', 'green', 'yellow', 'purple', 'orange', 
      'pink', 'black', 'white', 'brown', 'gray'
    ]
  },
  moods: {
    patterns: [
      /\b(calm|peaceful|serene|tranquil|zen)\b/gi,
      /\b(dramatic|intense|powerful|bold|striking)\b/gi,
      /\b(happy|joyful|cheerful|bright|uplifting)\b/gi,
      /\b(sad|melancholy|somber|moody|dark)\b/gi,
      /\b(romantic|love|intimate|tender|soft)\b/gi,
      /\b(energetic|dynamic|vibrant|lively|active)\b/gi,
      /\b(mysterious|enigmatic|shadowy|hidden|secret)\b/gi,
      /\b(vintage|retro|classic|old|nostalgic)\b/gi,
      /\b(modern|contemporary|futuristic|sleek|minimal)\b/gi
    ],
    keywords: [
      'nature', 'urban', 'peaceful', 'dramatic', 'vintage', 
      'modern', 'romantic', 'energetic', 'mysterious'
    ]
  },
  subjects: {
    patterns: [
      /\b(person|people|human|man|woman|child|portrait)\b/gi,
      /\b(animal|cat|dog|bird|wildlife|pet)\b/gi,
      /\b(landscape|mountain|ocean|forest|desert|field)\b/gi,
      /\b(city|urban|building|architecture|street)\b/gi,
      /\b(flower|plant|tree|garden|botanical)\b/gi,
      /\b(food|meal|cooking|restaurant|kitchen)\b/gi,
      /\b(car|vehicle|transportation|road|travel)\b/gi,
      /\b(technology|computer|phone|gadget|digital)\b/gi,
      /\b(art|painting|sculpture|creative|artistic)\b/gi,
      /\b(sport|fitness|exercise|athletic|game)\b/gi
    ],
    keywords: [
      'people', 'animals', 'landscape', 'city', 'flowers', 
      'food', 'cars', 'technology', 'art', 'sports'
    ]
  },
  times: {
    patterns: [
      /\b(sunrise|dawn|morning|early)\b/gi,
      /\b(sunset|dusk|evening|golden hour)\b/gi,
      /\b(night|nighttime|dark|midnight)\b/gi,
      /\b(day|daytime|noon|afternoon)\b/gi,
      /\b(winter|snow|cold|frost)\b/gi,
      /\b(summer|sun|hot|warm)\b/gi,
      /\b(spring|bloom|fresh|new)\b/gi,
      /\b(autumn|fall|leaves|harvest)\b/gi
    ],
    keywords: [
      'sunrise', 'sunset', 'night', 'day', 'winter', 
      'summer', 'spring', 'autumn'
    ]
  }
};

// Enhanced search query processor
export const processNaturalLanguageQuery = (query) => {
  if (!query || query.trim().length === 0) return '';
  
  const originalQuery = query.toLowerCase().trim();
  let processedTerms = [];
  let foundMatches = false;

  // Check for color mentions
  nlpPatterns.colors.patterns.forEach((pattern, index) => {
    if (pattern.test(originalQuery)) {
      processedTerms.push(nlpPatterns.colors.keywords[index]);
      foundMatches = true;
    }
  });

  // Check for mood/style mentions
  nlpPatterns.moods.patterns.forEach((pattern, index) => {
    if (pattern.test(originalQuery)) {
      processedTerms.push(nlpPatterns.moods.keywords[index]);
      foundMatches = true;
    }
  });

  // Check for subject mentions
  nlpPatterns.subjects.patterns.forEach((pattern, index) => {
    if (pattern.test(originalQuery)) {
      processedTerms.push(nlpPatterns.subjects.keywords[index]);
      foundMatches = true;
    }
  });

  // Check for time/season mentions
  nlpPatterns.times.patterns.forEach((pattern, index) => {
    if (pattern.test(originalQuery)) {
      processedTerms.push(nlpPatterns.times.keywords[index]);
      foundMatches = true;
    }
  });

  // If no patterns matched, use the original query
  if (!foundMatches) {
    // Extract meaningful words (remove common words)
    const stopWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'with', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'but'];
    const words = originalQuery.split(' ').filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );
    processedTerms = words;
  }

  return processedTerms.join(' ');
};

// Smart search suggestions
export const getSearchSuggestions = (query) => {
  const suggestions = [
    // Color-based suggestions
    'red sunset over mountains',
    'blue ocean waves',
    'green forest landscape',
    'golden hour photography',
    'purple flowers in bloom',
    
    // Mood-based suggestions
    'peaceful nature scenes',
    'dramatic black and white',
    'vintage street photography',
    'modern architecture',
    'romantic couple portraits',
    
    // Subject-based suggestions
    'cute animals playing',
    'city skyline at night',
    'delicious food photography',
    'artistic abstract patterns',
    'people enjoying life'
  ];

  if (!query || query.length < 2) return suggestions.slice(0, 5);

  // Filter suggestions based on query
  const filtered = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.length > 0 ? filtered.slice(0, 5) : suggestions.slice(0, 5);
};

// Enhanced search with multiple strategies and pagination
export const performSmartSearch = async (query, clientId, page = 1) => {
  try {
    const processedQuery = processNaturalLanguageQuery(query);
    const searchTerms = processedQuery || query;

    console.log('Original query:', query);
    console.log('Processed query:', searchTerms);

    // Primary search with processed terms
    const response = await axios.get(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerms)}&per_page=30&page=${page}&order_by=relevant`,
      {
        headers: {
          Authorization: `Client-ID ${clientId}`
        }
      }
    );

    let results = response.data.results;
    let total = response.data.total;

    // If no results with processed query on first page, try original query
    if (results.length === 0 && processedQuery !== query && page === 1) {
      const fallbackResponse = await axios.get(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&page=${page}&order_by=relevant`,
        {
          headers: {
            Authorization: `Client-ID ${clientId}`
          }
        }
      );
      results = fallbackResponse.data.results;
      total = fallbackResponse.data.total;
    }

    return {
      results: results.map(res => ({
        id: res.id,
        srcs: res.urls,
        alt: res.alt_description,
        likes: res.likes,
        user: res.user,
        tags: res.tags || [],
        description: res.description,
        color: res.color
      })),
      total: total,
      totalPages: Math.ceil(total / 30),
      currentPage: page,
      processedQuery: searchTerms
    };

  } catch (error) {
    console.error('Smart search error:', error);
    throw error;
  }
};

// Color-based search enhancement
export const searchByDominantColor = async (colorHex, clientId) => {
  try {
    const response = await axios.get(
      `https://api.unsplash.com/search/photos?query=color:${colorHex}&per_page=20&page=1`,
      {
        headers: {
          Authorization: `Client-ID ${clientId}`
        }
      }
    );

    return response.data.results.map(res => ({
      id: res.id,
      srcs: res.urls,
      alt: res.alt_description,
      likes: res.likes,
      user: res.user,
      color: res.color
    }));

  } catch (error) {
    console.error('Color search error:', error);
    return [];
  }
};

// Search history and analytics
export const saveSearchQuery = (query, results) => {
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  const searchEntry = {
    query,
    timestamp: new Date().toISOString(),
    resultCount: results.length,
    id: Date.now()
  };
  
  searchHistory.unshift(searchEntry);
  // Keep only last 50 searches
  const trimmedHistory = searchHistory.slice(0, 50);
  localStorage.setItem('searchHistory', JSON.stringify(trimmedHistory));
};

export const getSearchHistory = () => {
  return JSON.parse(localStorage.getItem('searchHistory') || '[]');
};

export const getPopularSearches = () => {
  const history = getSearchHistory();
  const queryCount = {};
  
  history.forEach(entry => {
    queryCount[entry.query] = (queryCount[entry.query] || 0) + 1;
  });
  
  return Object.entries(queryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([query]) => query);
};
