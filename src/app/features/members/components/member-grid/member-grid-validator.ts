import { ValueSetterParams } from 'ag-grid-community';
import { HealthMetricsUtils } from '../../../../core/utils/health-metrics.utils';

export class MemberValidator {
  static setWeight(params: ValueSetterParams): boolean {
    const val = Number(params.newValue);
    if (isNaN(val) || val <= 0) return false;

    params.data.weight = val;

    // Auto-calculate all health metrics
    MemberValidator.recalculateGymMetrics(params.data);
    return true;
  }

  static setHeight(params: ValueSetterParams): boolean {
    const val = Number(params.newValue);
    if (isNaN(val) || val <= 0) return false;

    params.data.height = val;

    // Auto-calculate all health metrics
    MemberValidator.recalculateGymMetrics(params.data);
    return true;
  }

  /**
   * Helper to execute calculations and bind them to the row dataset
   */
  private static recalculateGymMetrics(data: any): void {
    const metrics = HealthMetricsUtils.calculateAll(data.weight, data.height);

    // Merge calculated values directly onto the current row object reference
    data.bmi = metrics.bmi;
    data.bmiCategory = metrics.bmiCategory;
    data.idealWeight = metrics.idealWeight;
    data.dailyCalories = metrics.dailyCalories;
    data.dailyProteinGrams = metrics.dailyProteinGrams;
    data.dailyWaterLiters = metrics.dailyWaterLiters;
  }
}
