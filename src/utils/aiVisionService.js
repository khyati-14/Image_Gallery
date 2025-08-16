// AI Vision Service for Image Tagging
// Supports Google Vision API, Azure Computer Vision API, and OpenAI Vision API

class AIVisionService {
  constructor() {
    this.googleApiKey = process.env.REACT_APP_GOOGLE_VISION_API_KEY;
    this.azureEndpoint = process.env.REACT_APP_AZURE_VISION_ENDPOINT;
    this.azureApiKey = process.env.REACT_APP_AZURE_VISION_API_KEY;
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
  }

  // Get tags from local storage
  getStoredTags(imageId) {
    const storedTags = localStorage.getItem(`ai_tags_${imageId}`);
    return storedTags ? JSON.parse(storedTags) : null;
  }

  // Store tags in local storage
  storeTags(imageId, tags) {
    localStorage.setItem(`ai_tags_${imageId}`, JSON.stringify(tags));
  }

  // Google Vision API implementation
  async getGoogleVisionTags(imageUrl) {
    if (!this.googleApiKey) {
      throw new Error('Google Vision API key not configured');
    }

    try {
      const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${this.googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              source: {
                imageUri: imageUrl
              }
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 5 }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (data.responses && data.responses[0]) {
        const labels = data.responses[0].labelAnnotations || [];
        const objects = data.responses[0].localizedObjectAnnotations || [];
        
        const tags = [
          ...labels.map(label => ({
            name: label.description,
            confidence: Math.round(label.score * 100),
            provider: 'Google Vision'
          })),
          ...objects.map(obj => ({
            name: obj.name,
            confidence: Math.round(obj.score * 100),
            provider: 'Google Vision'
          }))
        ];

        return tags.sort((a, b) => b.confidence - a.confidence);
      }
      
      return [];
    } catch (error) {
      console.error('Google Vision API error:', error);
      throw error;
    }
  }

  // Azure Computer Vision API implementation
  async getAzureVisionTags(imageUrl) {
    if (!this.azureEndpoint || !this.azureApiKey) {
      throw new Error('Azure Vision API credentials not configured');
    }

    try {
      const response = await fetch(`${this.azureEndpoint}/vision/v3.2/analyze?visualFeatures=Tags,Objects,Categories&language=en`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.azureApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: imageUrl
        })
      });

      const data = await response.json();
      
      const tags = [];
      
      // Add tags
      if (data.tags) {
        tags.push(...data.tags.map(tag => ({
          name: tag.name,
          confidence: Math.round(tag.confidence * 100),
          provider: 'Azure Vision'
        })));
      }
      
      // Add objects
      if (data.objects) {
        tags.push(...data.objects.map(obj => ({
          name: obj.object,
          confidence: Math.round(obj.confidence * 100),
          provider: 'Azure Vision'
        })));
      }
      
      // Add categories
      if (data.categories) {
        tags.push(...data.categories
          .filter(cat => cat.score > 0.3)
          .map(cat => ({
            name: cat.name.split('_').pop(),
            confidence: Math.round(cat.score * 100),
            provider: 'Azure Vision'
          })));
      }

      return tags.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Azure Vision API error:', error);
      throw error;
    }
  }

  // OpenAI Vision API implementation
  async getOpenAIVisionTags(imageUrl) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image and provide relevant tags/keywords that describe what you see. Return only a comma-separated list of single words or short phrases, focusing on objects, scenes, colors, mood, and style. Maximum 10 tags."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        const tagNames = content.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        
        return tagNames.map(name => ({
          name,
          confidence: 85, // OpenAI doesn't provide confidence scores, so we use a default
          provider: 'OpenAI Vision'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('OpenAI Vision API error:', error);
      throw error;
    }
  }

  // Generate mock tags as fallback
  generateMockTags(imageUrl) {
    const mockTags = [
      'nature', 'landscape', 'photography', 'outdoor', 'scenic',
      'beautiful', 'artistic', 'creative', 'colorful', 'peaceful'
    ];
    
    // Generate 3-6 random tags
    const numTags = Math.floor(Math.random() * 4) + 3;
    const selectedTags = [];
    
    for (let i = 0; i < numTags; i++) {
      const randomTag = mockTags[Math.floor(Math.random() * mockTags.length)];
      if (!selectedTags.find(tag => tag.name === randomTag)) {
        selectedTags.push({
          name: randomTag,
          confidence: Math.floor(Math.random() * 30) + 70, // 70-99%
          provider: 'Mock'
        });
      }
    }
    
    return selectedTags.sort((a, b) => b.confidence - a.confidence);
  }

  // Main method to get tags for an image
  async getImageTags(imageId, imageUrl, provider = 'auto') {
    // Check if we already have tags stored
    const storedTags = this.getStoredTags(imageId);
    if (storedTags && storedTags.length > 0) {
      return storedTags;
    }

    let tags = [];

    try {
      if (provider === 'google' || provider === 'auto') {
        try {
          tags = await this.getGoogleVisionTags(imageUrl);
          if (tags.length > 0) {
            this.storeTags(imageId, tags);
            return tags;
          }
        } catch (error) {
          console.log('Google Vision failed, trying next provider...');
        }
      }

      if (provider === 'azure' || (provider === 'auto' && tags.length === 0)) {
        try {
          tags = await this.getAzureVisionTags(imageUrl);
          if (tags.length > 0) {
            this.storeTags(imageId, tags);
            return tags;
          }
        } catch (error) {
          console.log('Azure Vision failed, trying next provider...');
        }
      }

      if (provider === 'openai' || (provider === 'auto' && tags.length === 0)) {
        try {
          tags = await this.getOpenAIVisionTags(imageUrl);
          if (tags.length > 0) {
            this.storeTags(imageId, tags);
            return tags;
          }
        } catch (error) {
          console.log('OpenAI Vision failed, using mock tags...');
        }
      }

      // Fallback to mock tags if all APIs fail
      if (tags.length === 0) {
        tags = this.generateMockTags(imageUrl);
        this.storeTags(imageId, tags);
      }

    } catch (error) {
      console.error('Error getting image tags:', error);
      tags = this.generateMockTags(imageUrl);
      this.storeTags(imageId, tags);
    }

    return tags;
  }

  // Search images by tags
  searchByTags(images, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return images;
    }

    const searchTermLower = searchTerm.toLowerCase();
    
    return images.filter(image => {
      const storedTags = this.getStoredTags(image.id);
      if (!storedTags) return false;
      
      return storedTags.some(tag => 
        tag.name.toLowerCase().includes(searchTermLower)
      );
    });
  }

  // Get all unique tags from stored data
  getAllTags() {
    const allTags = new Set();
    
    // Iterate through localStorage to find all stored tags
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ai_tags_')) {
        try {
          const tags = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(tags)) {
            tags.forEach(tag => allTags.add(tag.name));
          }
        } catch (error) {
          console.error('Error parsing stored tags:', error);
        }
      }
    }
    
    return Array.from(allTags).sort();
  }

  // Clear all stored tags
  clearAllTags() {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ai_tags_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

export default new AIVisionService();
