const dietRepo = require('../repository/dietRepository');
const gemini = require('./geminiService');

const generateAndSavePlan = async (userData) => {
  const plan = await gemini.generateDietFromPrompt(userData);
  const saved = await dietRepo.createDiet(plan);
  return saved;
};

const listPlans = async (filter) => {
  return dietRepo.findAll(filter);
};

module.exports = { generateAndSavePlan, listPlans };
