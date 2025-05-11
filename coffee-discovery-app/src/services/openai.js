import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be proxied through your backend
});

// Parse user input to extract coffee preferences
export const extractCoffeePreferences = async (userPrompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a coffee expert assistant. Extract structured information about coffee preferences from user queries.
          Return ONLY a JSON object with the following fields (leave empty if not mentioned):
          - roastLevel: (light, medium, dark, or empty)
          - acidity: (low, medium, high, or empty)
          - origin: (country/region name or empty)
          - flavorNotes: (array of flavor notes or empty array)
          - otherPreferences: (any other relevant preferences or empty)`
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error extracting coffee preferences:', error);
    // Provide default structure on error
    return {
      roastLevel: "",
      acidity: "",
      origin: "",
      flavorNotes: [],
      otherPreferences: ""
    };
  }
};

// Generate descriptions for coffee products when needed
export const generateCoffeeDescription = async (coffeeDetails) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a coffee expert who writes engaging, concise coffee descriptions.
          Write a compelling 2-3 sentence description for a coffee product with the provided details.
          Focus on flavor profile, origin characteristics, and brewing recommendations.`
        },
        {
          role: "user",
          content: `Generate a description for this coffee:
          Name: ${coffeeDetails.name}
          Origin: ${coffeeDetails.origin || 'Unknown'}
          Roast Level: ${coffeeDetails.roastLevel || 'Medium'}
          Flavor Notes: ${coffeeDetails.flavorNotes?.join(', ') || 'Not specified'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating coffee description:', error);
    return 'A delightful coffee with a unique character and flavor profile.';
  }
};

// Generate appropriate search tags for web search based on user preferences
export const generateSearchQuery = async (preferences) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a search query optimization assistant. 
          Generate a concise search query for finding coffee products based on the provided preferences.
          The query should be optimized for web search engines to find relevant coffee products.`
        },
        {
          role: "user",
          content: `Create a search query for coffee with these preferences:
          Roast Level: ${preferences.roastLevel || 'any'}
          Acidity: ${preferences.acidity || 'any'}
          Origin: ${preferences.origin || 'any'}
          Flavor Notes: ${preferences.flavorNotes?.join(', ') || 'any'}
          Other: ${preferences.otherPreferences || 'none'}`
        }
      ],
      temperature: 0.3,
      max_tokens: 30
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating search query:', error);
    
    // Build a fallback query from the preferences
    const parts = [];
    if (preferences.origin) parts.push(preferences.origin);
    if (preferences.roastLevel) parts.push(`${preferences.roastLevel} roast`);
    if (preferences.acidity) parts.push(`${preferences.acidity} acidity`);
    
    return parts.length > 0 
      ? `${parts.join(' ')} coffee beans`
      : 'specialty coffee beans';
  }
};
