import { HealthMetrics } from '../../features/members/models/health-metrics.model';

export class HealthMetricsUtils {
  /**
   * Generates all downstream gym metrics if both height and weight are present
   */
  static calculateAll(
    weight: number | null,
    heightCm: number | null
  ): HealthMetrics {
    const fallback: HealthMetrics = {
      bmi: null,
      bmiCategory: null,
      idealWeight: null,
      dailyCalories: null,
      dailyProteinGrams: null,
      dailyWaterLiters: null,
    };

    if (!weight || !heightCm || weight <= 0 || heightCm <= 0) {
      return fallback;
    }

    const heightMeters = heightCm / 100;

    // 1. BMI Calculation ($BMI = \frac{weight}{height^2}$)
    const bmi = parseFloat((weight / (heightMeters * heightMeters)).toFixed(1));

    // 2. BMI Category
    let bmiCategory = 'Normal';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 25 && bmi < 29.9) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese';

    // 3. Ideal Body Weight (Devine Formula approximation for general reference)
    // Roughly aiming for a healthy median BMI of 22 for simple grid estimation
    const idealWeight = parseFloat(
      (22 * (heightMeters * heightMeters)).toFixed(1)
    );

    // 4. Daily Calorie Needs (Basal Metabolic Rate approximation using Mifflin-St Jeor baseline * 1.375 active factor)
    // Assuming a baseline active maintenance calculation
    const dailyCalories = Math.round(
      (10 * weight + 6.25 * heightCm - 5 * 25) * 1.375
    );

    // 5. Daily Protein Needed (Gym/Strength context: ~2g per kg of bodyweight)
    const dailyProteinGrams = Math.round(weight * 2);

    // 6. Daily Water Intake (Roughly 35ml per kg of bodyweight)
    const dailyWaterLiters = parseFloat(((weight * 35) / 1000).toFixed(1));

    return {
      bmi,
      bmiCategory,
      idealWeight,
      dailyCalories,
      dailyProteinGrams,
      dailyWaterLiters,
    };
  }
}
