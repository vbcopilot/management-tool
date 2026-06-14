// dashboard.service.ts
import { Injectable } from '@angular/core';
import { db } from '../../../core/db/app-db';

export interface DashboardData {
  // Members
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  newMembersThisMonth: number;
  bmiOverweight: number;
  bmiNormal: number;
  bmiUnderweight: number;
  ageGroups: { label: string; count: number }[];

  // Trainers
  totalTrainers: number;
  activeTrainers: number;
  inactiveTrainers: number;
  avgTrainerRating: number | null;
  membersPerTrainer: { name: string; count: number }[];
  specializations: { label: string; count: number }[];
  topRatedTrainers: { name: string; rating: number }[];

  // Financials
  totalSalaryPaid: number;
  totalPendingDues: number;
  totalBonus: number;
  totalDeduction: number;
  monthlySalaryTrend: { month: string; amount: number }[];

  // Operations
  paymentStatusBreakdown: { label: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  async computeAll(): Promise<DashboardData> {
    const [members, trainers] = await Promise.all([
      db.members.toArray(),
      db.trainers.toArray(),
    ]);

    // ── Members ────────────────────────────────────────────────────────────

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const totalMembers = members.length;
    const activeMembers = members.filter(
      (m: any) => m.status === 'Active'
    ).length;
    const inactiveMembers = totalMembers - activeMembers;

    const newMembersThisMonth = members.filter((m: any) => {
      if (!m.dateOfJoining) return false;
      const d = new Date(m.dateOfJoining);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // BMI = weight(kg) / (height(m))^2
    let bmiOverweight = 0,
      bmiNormal = 0,
      bmiUnderweight = 0;
    members.forEach((m: any) => {
      if (!m.weight || !m.height) return;
      const heightM = m.height / 100;
      const bmi = m.weight / (heightM * heightM);
      if (bmi >= 25) bmiOverweight++;
      else if (bmi >= 18.5) bmiNormal++;
      else bmiUnderweight++;
    });

    const ageBuckets: Record<string, number> = {
      '< 20': 0,
      '20–30': 0,
      '31–40': 0,
      '41–50': 0,
      '50+': 0,
    };
    members.forEach((m: any) => {
      const age = Number(m.age);
      if (!age) return;
      if (age < 20) ageBuckets['< 20']++;
      else if (age <= 30) ageBuckets['20–30']++;
      else if (age <= 40) ageBuckets['31–40']++;
      else if (age <= 50) ageBuckets['41–50']++;
      else ageBuckets['50+']++;
    });
    const ageGroups = Object.entries(ageBuckets).map(([label, count]) => ({
      label,
      count,
    }));

    // ── Trainers ───────────────────────────────────────────────────────────

    const totalTrainers = trainers.length;
    const activeTrainers = trainers.filter(
      (t: any) => t.status === 'Active'
    ).length;
    const inactiveTrainers = totalTrainers - activeTrainers;

    const ratingsArr = trainers
      .map((t: any) => t.averageRating)
      .filter((r: any) => r !== null && r !== undefined) as number[];
    const avgTrainerRating = ratingsArr.length
      ? Math.round(
          (ratingsArr.reduce((a, b) => a + b, 0) / ratingsArr.length) * 10
        ) / 10
      : null;

    const membersPerTrainer = trainers.map((t: any) => ({
      name: t.name ?? 'Unknown',
      count: Array.isArray(t.membersAssigned)
        ? t.membersAssigned.filter((m: any) => m.isAssigned).length
        : 0,
    }));

    const specMap: Record<string, number> = {};
    trainers.forEach((t: any) => {
      const s = t.specialization ?? t.speaciality ?? 'Other';
      specMap[s] = (specMap[s] || 0) + 1;
    });
    const specializations = Object.entries(specMap).map(([label, count]) => ({
      label,
      count,
    }));

    const topRatedTrainers = trainers
      .filter((t: any) => t.averageRating != null)
      .map((t: any) => ({
        name: t.name ?? 'Unknown',
        rating: t.averageRating as number,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // ── Financials ─────────────────────────────────────────────────────────

    let totalSalaryPaid = 0;
    let totalPendingDues = 0;
    let totalBonus = 0;
    let totalDeduction = 0;
    const monthlyMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {
      Paid: 0,
      Partial: 0,
      Pending: 0,
      Advance: 0,
    };

    trainers.forEach((t: any) => {
      const history: any[] = t.paymentHistory ?? [];
      history.forEach((p: any) => {
        // Payment status breakdown
        if (p.status && statusMap[p.status] !== undefined) {
          statusMap[p.status]++;
        }

        // Financials
        const net = p.netAmount || 0;
        if (p.status === 'Paid' || p.status === 'Partial')
          totalSalaryPaid += net;
        if (p.status === 'Pending') totalPendingDues += net;
        totalBonus += p.bonus || 0;
        totalDeduction += p.deduction || 0;

        // Monthly trend — key by YYYY-MM
        if (p.paymentDate && (p.status === 'Paid' || p.status === 'Partial')) {
          const key = p.paymentDate.slice(0, 7); // 'YYYY-MM'
          monthlyMap[key] = (monthlyMap[key] || 0) + net;
        }
      });
    });

    const monthlySalaryTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => ({ month, amount }));

    const paymentStatusBreakdown = Object.entries(statusMap).map(
      ([label, count]) => ({ label, count })
    );

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      newMembersThisMonth,
      bmiOverweight,
      bmiNormal,
      bmiUnderweight,
      ageGroups,
      totalTrainers,
      activeTrainers,
      inactiveTrainers,
      avgTrainerRating,
      membersPerTrainer,
      specializations,
      topRatedTrainers,
      totalSalaryPaid,
      totalPendingDues,
      totalBonus,
      totalDeduction,
      monthlySalaryTrend,
      paymentStatusBreakdown,
    };
  }
}
