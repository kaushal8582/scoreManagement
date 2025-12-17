export type Timeframe = "weekly" | "monthly";

export interface TeamPerformancePoint {
  week: string;
  team: string;
  points: number;
}

export interface TeamSummary {
  team: string;
  totalPoints: number;
}

export interface PerformerSummary {
  user: string;
  team: string;
  totalPoints: number;
}

export const teamPerformanceWeekly: TeamPerformancePoint[] = [
  { week: "Week 1", team: "Alpha", points: 320 },
  { week: "Week 1", team: "Bravo", points: 280 },
  { week: "Week 1", team: "Delta", points: 240 },
  { week: "Week 2", team: "Alpha", points: 360 },
  { week: "Week 2", team: "Bravo", points: 295 },
  { week: "Week 2", team: "Delta", points: 260 },
  { week: "Week 3", team: "Alpha", points: 390 },
  { week: "Week 3", team: "Bravo", points: 310 },
  { week: "Week 3", team: "Delta", points: 275 },
  { week: "Week 4", team: "Alpha", points: 410 },
  { week: "Week 4", team: "Bravo", points: 345 },
  { week: "Week 4", team: "Delta", points: 295 }
];

export const teamPerformanceMonthly: TeamPerformancePoint[] = [
  { week: "Jan", team: "Alpha", points: 1400 },
  { week: "Jan", team: "Bravo", points: 1240 },
  { week: "Jan", team: "Delta", points: 980 },
  { week: "Feb", team: "Alpha", points: 1520 },
  { week: "Feb", team: "Bravo", points: 1320 },
  { week: "Feb", team: "Delta", points: 1050 },
  { week: "Mar", team: "Alpha", points: 1630 },
  { week: "Mar", team: "Bravo", points: 1385 },
  { week: "Mar", team: "Delta", points: 1110 }
];

export const topTeams: TeamSummary[] = [
  { team: "Alpha", totalPoints: 1480 },
  { team: "Bravo", totalPoints: 1230 },
  { team: "Delta", totalPoints: 1070 }
];

export const topPerformers: PerformerSummary[] = [
  { user: "Sarah Lee", team: "Alpha", totalPoints: 510 },
  { user: "Marcus Chen", team: "Bravo", totalPoints: 470 },
  { user: "Priya Patel", team: "Alpha", totalPoints: 455 }
];

export interface UserRow {
  id: number;
  firstName: string;
  lastName: string;
  category: string;
}

export const users: UserRow[] = [
  { id: 1, firstName: "Sarah", lastName: "Lee", category: "Engineer" },
  { id: 2, firstName: "Marcus", lastName: "Chen", category: "Engineer" },
  { id: 3, firstName: "Priya", lastName: "Patel", category: "Product" },
  { id: 4, firstName: "Diego", lastName: "Ramirez", category: "Design" },
  { id: 5, firstName: "Hannah", lastName: "Smith", category: "Operations" }
];


