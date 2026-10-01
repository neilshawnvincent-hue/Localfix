// ─────────────────────────────────────────────────────────────
// Labour Market Intelligence — Dummy Data for Indore District
// ─────────────────────────────────────────────────────────────

/* ── Summary statistics ── */

export interface SummaryStat {
  id: string;
  label: string;
  value: string;
  subtext: string;
  /** Percentage change relative to the previous period. */
  change: number;
  trend: 'up' | 'down';
}

export const summaryStats: SummaryStat[] = [
  {
    id: 'total-workers',
    label: 'Total Registered Workers',
    value: '14,832',
    subtext: 'Indore District',
    change: 12.4,
    trend: 'up',
  },
  {
    id: 'tasks-completed',
    label: 'Tasks Completed',
    value: '3,247',
    subtext: 'This month',
    change: 8.1,
    trend: 'up',
  },
  {
    id: 'projected-demand',
    label: 'Projected Demand',
    value: '22,150',
    subtext: 'Next 6 months (AI forecast)',
    change: 34.2,
    trend: 'up',
  },
];

/* ── Supply vs. Demand by trade ── */

export interface SupplyDemandItem {
  trade: string;
  /** Number of currently certified workers. */
  currentSupply: number;
  /** AI-predicted job openings in the next 6 months. */
  projectedDemand: number;
}

export const supplyDemandData: SupplyDemandItem[] = [
  // Oversupply — high supply, low demand
  { trade: 'Electrician', currentSupply: 4200, projectedDemand: 2100 },
  // Roughly balanced
  { trade: 'Plumber', currentSupply: 2800, projectedDemand: 3100 },
  // Moderate shortage
  { trade: 'CNC Operator', currentSupply: 1200, projectedDemand: 1800 },
  // Acute shortage — low supply, high demand
  { trade: 'Solar Technician', currentSupply: 380, projectedDemand: 2900 },
];

/* ── Early-warning alerts for government planners ── */

export interface EarlyWarning {
  id: string;
  /** 'red' = oversupply, 'green' = shortage */
  severity: 'red' | 'green';
  trade: string;
  recommendation: string;
}

export const earlyWarnings: EarlyWarning[] = [
  {
    id: 'ew-1',
    severity: 'red',
    trade: 'Electrician',
    recommendation:
      'Oversupply detected (4,200 certified vs. 2,100 projected openings). Recommend reskilling 2,100 electricians towards Solar Technician or EV charging installation roles via PMKVY bridge courses.',
  },
  {
    id: 'ew-2',
    severity: 'green',
    trade: 'Solar Technician',
    recommendation:
      'Acute shortage (380 certified vs. 2,900 projected openings). Fast-track 500 certifications through the PMKVY solar installation module by Q2 2027. Prioritize ITI Indore and Dewas.',
  },
  {
    id: 'ew-3',
    severity: 'green',
    trade: 'CNC Operator',
    recommendation:
      'Moderate shortage (1,200 vs. 1,800). Partner with Indore ITIs and Pithampur industrial cluster to increase CNC training batch size by 40%.',
  },
  {
    id: 'ew-4',
    severity: 'red',
    trade: 'Electrician',
    recommendation:
      'Halt new electrician certifications in Indore for 6 months. Redirect ₹1.2 Cr training budget to deficit trades (Solar, CNC) to rebalance the district labour pool.',
  },
];
