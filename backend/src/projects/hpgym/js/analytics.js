export const getFitnessAnalysis = (req, res) => {
  try {
    const { weight, height, age, gender, activityLevel, goal } = req.body;

    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
      res.status(400).json({ success: false, message: 'All profile parameters are required' });
      return;
    }

    // 1. Calculate Basal Metabolic Rate (BMR) - Harris-Benedict Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // 2. Calculate Total Daily Energy Expenditure (TDEE)
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };
    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

    // 3. Determine target daily calories based on goal
    let targetCalories = tdee;
    let deficitOrSurplus = 0;
    if (goal === 'fat_loss') {
      deficitOrSurplus = -500; // standard healthy deficit
      targetCalories = tdee + deficitOrSurplus;
    } else if (goal === 'muscle_gain') {
      deficitOrSurplus = 300; // standard clean surplus
      targetCalories = tdee + deficitOrSurplus;
    }

    // 4. Forecast weight trajectory over 12 weeks (Linear Projection model)
    // 7700 calories is approximately equal to 1 kg of fat
    const trajectory = [];
    let currentWeight = weight;
    for (let week = 0; week <= 12; week++) {
      trajectory.push({
        week,
        projectedWeight: parseFloat(currentWeight.toFixed(2)),
      });
      // Weekly change = (daily deficit/surplus * 7 days) / 7700
      const weeklyChange = (deficitOrSurplus * 7) / 7700;
      currentWeight += weeklyChange;
    }

    // 5. Workout and Macro Recommendation Engine (Rule-based Decision System)
    let macros = { carbs: 40, protein: 30, fat: 30 }; // default distribution %
    let workoutPlan = {
      type: 'Balanced Training',
      frequency: '3-4 days/week',
      focus: ['Cardio', 'General Strength', 'Flexibility'],
      intensity: 'Moderate',
    };

    if (goal === 'fat_loss') {
      macros = { carbs: 35, protein: 40, fat: 25 }; // High protein, lower carb
      workoutPlan = {
        type: 'HIIT & Resistance Circuit',
        frequency: '4-5 days/week',
        focus: ['High-Intensity Interval Training', 'Full-Body Resistance', 'Cardiovascular Endurance'],
        intensity: 'High',
      };
    } else if (goal === 'muscle_gain') {
      macros = { carbs: 50, protein: 30, fat: 20 }; // Higher carb for energy/recovery
      workoutPlan = {
        type: 'Hypertrophy Strength Split',
        frequency: '4-6 days/week',
        focus: ['Progressive Overload Weightlifting', 'Targeted Muscle Group Splits', 'Strength & Power'],
        intensity: 'High',
      };
    }

    res.json({
      success: true,
      data: {
        bmr: Math.round(bmr),
        tdee,
        targetCalories: Math.round(targetCalories),
        macros,
        workoutPlan,
        trajectory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
