import React, { useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { showToast } from '@/utils/customToast';
import { motion } from 'framer-motion';
import { 
  Dumbbell, Apple, Activity, TrendingUp, Sparkles, 
  User, Calendar, HelpCircle, RefreshCw, ChevronRight 
} from 'lucide-react';

const FitnessAnalysis = () => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderately_active',
    goal: 'fat_loss',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Simple client validation
    const { weight, height, age } = formData;
    if (!weight || !height || !age) {
      showToast('Please fill all numerical fields', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/hpgym/fitness-analysis', {
        weight: Number(weight),
        height: Number(height),
        age: Number(age),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
      });

      if (response.data.success) {
        setResult(response.data.data);
        showToast('Fitness Analysis Calculated!', 'success');
      } else {
        showToast(response.data.message || 'Something went wrong', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Error communicating with analytics server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="text-red-500" size={32} />
            AI Fitness & Macro Analyzer
          </h1>
          <p className="text-gray-500 mt-1">
            Input your vitals and goals to project weight trajectory and generate personalized workouts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <User size={18} className="text-gray-400" />
            Your Vitals
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 75"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g. 175"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Age (years)</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 28"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Activity Level</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              >
                <option value="sedentary">Sedentary (Little/No exercise)</option>
                <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                <option value="very_active">Very Active (6-7 days/week)</option>
                <option value="extra_active">Super Active (Physical Job/Athletic)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Fitness Goal</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              >
                <option value="fat_loss">Fat Loss</option>
                <option value="muscle_gain">Muscle Gain (Hypertrophy)</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-red-600 transition-colors shadow-md disabled:bg-gray-300"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Calculate Analysis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results / Analytics panel */}
        <div className="lg:col-span-8">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Vitals overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Basal Metabolic Rate (BMR)</span>
                  <span className="text-2xl font-black text-gray-800 mt-2">{result.bmr} <span className="text-xs text-gray-400 font-normal">kcal/day</span></span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">TDEE (Daily Burn)</span>
                  <span className="text-2xl font-black text-gray-800 mt-2">{result.tdee} <span className="text-xs text-gray-400 font-normal">kcal/day</span></span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between ring-2 ring-red-500/10 bg-red-50/10">
                  <span className="text-red-600 text-sm font-bold uppercase tracking-wider">Target Calorie Intake</span>
                  <span className="text-2xl font-black text-red-600 mt-2">{result.targetCalories} <span className="text-xs text-red-400 font-normal">kcal/day</span></span>
                </div>
              </div>

              {/* Nutrition & Workouts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Diet macros card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
                    <Apple size={20} className="text-green-500" />
                    Target Macro Distribution
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-gray-600">Carbohydrates ({result.macros.carbs}%)</span>
                        <span className="text-gray-800 font-bold">{Math.round((result.targetCalories * result.macros.carbs) / 400)}g</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${result.macros.carbs}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-gray-600">Protein ({result.macros.protein}%)</span>
                        <span className="text-gray-800 font-bold">{Math.round((result.targetCalories * result.macros.protein) / 400)}g</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${result.macros.protein}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-gray-600">Fats ({result.macros.fat}%)</span>
                        <span className="text-gray-800 font-bold">{Math.round((result.targetCalories * result.macros.fat) / 900)}g</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${result.macros.fat}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workout card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
                    <Dumbbell size={20} className="text-red-500" />
                    AI Workout Recommendation
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm"><strong className="text-gray-600">Routine Type:</strong> <span className="text-gray-800 font-semibold">{result.workoutPlan.type}</span></p>
                    <p className="text-sm"><strong className="text-gray-600">Frequency:</strong> <span className="text-gray-800 font-semibold">{result.workoutPlan.frequency}</span></p>
                    <p className="text-sm"><strong className="text-gray-600">Intensity Level:</strong> <span className="inline-flex px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-md uppercase tracking-wider">{result.workoutPlan.intensity}</span></p>
                    <div>
                      <strong className="text-sm text-gray-600 block mb-1">Key Focus Areas:</strong>
                      <div className="flex flex-wrap gap-2">
                        {result.workoutPlan.focus.map((focusItem, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            {focusItem}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trajectory Prediction List */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" />
                  12-Week Weight Projection Trajectory
                </h3>
                <p className="text-xs text-gray-400">Predicted trend using our linear calorie-deficit model calculation.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {result.trajectory.filter((_, idx) => idx % 2 === 0).map((point) => (
                    <div key={point.week} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                      <span className="block text-xs font-semibold text-gray-400">Week {point.week}</span>
                      <span className="block text-base font-extrabold text-gray-800 mt-1">{point.projectedWeight} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] bg-white border border-dashed border-gray-300 rounded-2xl flex flex-col justify-center items-center p-8 text-center">
              <HelpCircle className="text-gray-300 animate-pulse" size={48} />
              <h3 className="text-gray-700 font-bold mt-4">No analysis loaded</h3>
              <p className="text-gray-400 text-sm max-w-sm mt-1">
                Enter your current weights, heights, and target goals on the left panel to execute the algorithms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FitnessAnalysis;
