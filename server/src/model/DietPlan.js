const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  time: String,
});

const DietPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: String },
  totalCalories: { type: Number },
  meals: [MealSchema],
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
