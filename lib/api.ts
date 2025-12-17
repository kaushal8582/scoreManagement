export const API_BASE = "http://localhost:3220/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Ensure a concrete headers type to satisfy Fetch's HeadersInit
function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Auth
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return handleJson<{ user: any; token: string }>(res);
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  category?: string
) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password, category })
  });
  return handleJson<{ user: any; token: string }>(res);
}

// Dashboard
export interface TeamPerformancePoint {
  week: string;
  team: string;
  points: number;
}

export async function fetchTeamStatsByWeek(): Promise<TeamPerformancePoint[]> {
  const res = await fetch(`${API_BASE}/dashboard/team-stats`, {
    headers: { ...authHeaders() }
  });
  const data = await handleJson<
    { teamName: string; weekStartDate: string; totalPoints: number }[]
  >(res);
  return data.map((d) => ({
    week: new Date(d.weekStartDate).toLocaleDateString(),
    team: d.teamName,
    points: d.totalPoints
  }));
}

export async function fetchTopTeams(limit = 3): Promise<{
  team: string;
  totalPoints: number;
}[]> {
  const res = await fetch(`${API_BASE}/dashboard/top-teams?limit=${limit}`, {
    headers: { ...authHeaders() }
  });
  const data = await handleJson<
    { teamName: string; totalPoints: number }[]
  >(res);
  return data.map((d) => ({ team: d.teamName, totalPoints: d.totalPoints }));
}

export async function fetchTopPerformers(limit = 3): Promise<{
  user: string;
  team: string;
  totalPoints: number;
}[]> {
  const res = await fetch(
    `${API_BASE}/dashboard/top-performers?limit=${limit}`,
    { headers: { ...authHeaders() } }
  );
  const data = await handleJson<
    { fullName: string; teamName?: string; totalPoints: number }[]
  >(res);
  return data.map((d) => ({
    user: d.fullName,
    team: d.teamName ?? "",
    totalPoints: d.totalPoints
  }));
}

// Users
export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { ...authHeaders() }
  });
  return handleJson<
    { _id: string; firstName: string; lastName: string; category?: string }[]
  >(res);
}

export async function fetchUserTotals() {
  const res = await fetch(`${API_BASE}/dashboard/user-totals`, {
    headers: { ...authHeaders() }
  });
  return handleJson<{
    userId: string;
    fullName: string;
    teamName?: string;
    totalPoints: number;
  }[]>(res);
}

export async function uploadUsersCsv(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/users/upload-csv`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: fd
  });
  return handleJson<any>(res);
}

// Teams
export async function createTeam(name: string, userIds: string[]) {
  const res = await fetch(`${API_BASE}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name, userIds })
  });
  return handleJson<any>(res);
}

export async function fetchTeams() {
  const res = await fetch(`${API_BASE}/teams`, {
    headers: { ...authHeaders() }
  });
  return handleJson<any[]>(res);
}

export async function updateTeam(id: string, payload: { name?: string; userIds?: string[] }) {
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload)
  });
  return handleJson<any>(res);
}

export async function deleteTeam(id: string) {
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return handleJson<{ deletedTeamId: string }>(res);
}

// Reports
export async function uploadWeeklyReport(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/reports/upload-weekly`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: fd
  });
  return handleJson<any>(res);
}

export interface WeeklyReportSummary {
  _id: string;
  weekStartDate: string;
  weekEndDate: string;
  uploadedAt: string;
}

export async function fetchWeeklyReports(): Promise<WeeklyReportSummary[]> {
  const res = await fetch(`${API_BASE}/reports/weekly`, {
    headers: { ...authHeaders() }
  });
  return handleJson<WeeklyReportSummary[]>(res);
}

export async function deleteWeeklyReport(id: string) {
  const res = await fetch(`${API_BASE}/reports/weekly/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() }
  });
  return handleJson<{ deletedWeekId: string; deletedStats: number }>(res);
}