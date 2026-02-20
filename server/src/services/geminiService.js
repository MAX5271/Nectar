// Placeholder service for Gemini AI integration.
// Replace the implementation with real API calls to Gemini.

const generateDietFromPrompt = async (userData) => {
  // userData: { age, weight, height, goals }
  // This returns a mocked plan for now.
  const plan = {
    title: `Custom plan for ${userData?.name || 'user'}`,
    totalCalories: 2000,
    meals: [
      { name: 'Oatmeal + Fruit', calories: 400, time: '08:00' },
      { name: 'Chicken Salad', calories: 600, time: '13:00' },
      { name: 'Grilled Fish + Veg', calories: 700, time: '19:00' },
    ],
    meta: { generatedBy: 'gemini-mock' },
  };
  return plan;
};

module.exports = { generateDietFromPrompt };
