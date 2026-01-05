// Allow overriding API base via env
export const API_BASE = "https://bni-api.snabbtech.com/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Helper function to handle logout when token is invalid/expired
function handleLogout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Redirect to login page
  window.location.href = "/";
}

// Centralized API request function - all API calls go through here
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Get token and add to headers
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make the request
  const res = await fetch(url, {
    ...options,
    headers,
  });

  // console.log("res", res);

  // Handle response - check for errors first
  if (!res.ok) {
    const text = await res.text();
    let errorMessage = text || `Request failed: ${res.status}`;
    
    // Check for 401 Unauthorized status (token errors)
    if (res.status === 401) {
      // Try to parse JSON error message
      handleLogout();
      try {
        const errorJson = JSON.parse(text);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // If not JSON, use the text as is
      }
      
      // Check if error message is related to token (case-insensitive)
      const lowerMessage = errorMessage.toLowerCase();
      if (
        lowerMessage.includes("token") ||
        lowerMessage.includes("invalid") ||
        lowerMessage.includes("expired") ||
        lowerMessage.includes("authorization") ||
        lowerMessage.includes("unauthorized")
      ) {
        // Automatically log out user
        handleLogout();
        throw new Error("Session expired. Please login again.");
      }
    }
    
    throw new Error(errorMessage);
  }

  // Handle different response types for successful responses
  const contentType = res.headers.get("content-type");
  if (contentType && (contentType.includes("application/octet-stream") || contentType.includes("application/vnd.ms-excel") || contentType.includes("application/xls"))) {
    return res.blob() as any;
  } else if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  
  // Default to JSON for other content types
  return res.json();
}

// Legacy function for backward compatibility (now uses apiRequest)
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
  return apiRequest<{ user: any; token: string }>(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  category?: string
) {
  return apiRequest<{ user: any; token: string }>(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password, category })
  });
}

// Dashboard
export interface TeamPerformancePoint {
  week: string;
  team: string;
  points: number;
  weekStartDate?: string;
  weekEndDate?: string;
}

// Format date as DD.MM.YY (with year for desktop)
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2); // Last 2 digits of year
  return `${day}.${month}.${year}`;
}

export async function fetchTeamStatsByWeek(): Promise<TeamPerformancePoint[]> {
  const data = await apiRequest<
    { teamName: string; weekStartDate: string; weekEndDate?: string; totalPoints: number }[]
  >(`${API_BASE}/dashboard/team-stats`);
  return data.map((d) => {
    const startDate = formatDate(d.weekStartDate);
    const endDate = d.weekEndDate ? formatDate(d.weekEndDate) : null;
    const weekLabel = endDate ? `${startDate} - ${endDate}` : startDate;
    
    return {
      week: weekLabel,
      team: d.teamName,
      points: d.totalPoints,
      weekStartDate: d.weekStartDate,
      weekEndDate: d.weekEndDate
    };
  });
}

export async function fetchTopTeams(limit = 3): Promise<{
  team: string;
  totalPoints: number;
  captain?: string | null;
}[]> {
  const data = await apiRequest<
    { teamName: string; totalPoints: number; captainFullName?: string | null }[]
  >(`${API_BASE}/dashboard/top-teams?limit=${limit}`);
  return data.map((d) => ({ team: d.teamName, totalPoints: d.totalPoints, captain: d.captainFullName ?? null }));
}

export async function fetchTopPerformers(limit = 3): Promise<{
  user: string;
  team: string;
  totalPoints: number;
}[]> {
  const data = await apiRequest<
    { fullName: string; teamName?: string; totalPoints: number }[]
  >(`${API_BASE}/dashboard/top-performers?limit=${limit}`);
  return data.map((d) => ({
    user: d.fullName,
    team: d.teamName ?? "",
    totalPoints: d.totalPoints
  }));
}

// Users
export async function fetchUsers() {
  return apiRequest<
    { _id: string; firstName: string; lastName: string; category?: string }[]
  >(`${API_BASE}/users`);
}

export async function fetchUserTotals() {
  return apiRequest<{
    userId: string;
    fullName: string;
    teamName?: string;
    totalPoints: number;
  }[]>(`${API_BASE}/dashboard/user-totals`);
}

// New: Category totals across all weeks
export interface CategoryTotals {
  P: number; A: number; L: number; M: number; S: number;
  RGI: number; RGO: number; RRI: number; RRO: number;
  V: number; oneToOne: number; CEU: number; T: number; TYFCB_amount: number;
  totalPoints: number;
}

export async function fetchCategoryTotals(): Promise<CategoryTotals> {
  return apiRequest<CategoryTotals>(`${API_BASE}/dashboard/category-totals`);
}

// New: Per-user breakdown (optionally filter by teamId)
export interface UserBreakdownRow {
  userId: string;
  fullName: string;
  teamName?: string;
  P: number; A: number; L: number; M: number; S: number;
  RGI: number; RGO: number; RRI: number; RRO: number;
  V: number; oneToOne: number; CEU: number; T: number; TYFCB_amount: number;
  totalPoints: number;
}

export async function fetchUserBreakdown(limit = 7, teamId?: string): Promise<UserBreakdownRow[]> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (teamId) params.set('teamId', teamId);
  return apiRequest<UserBreakdownRow[]>(`${API_BASE}/dashboard/user-breakdown?${params.toString()}`);
}

// New: Per-team breakdown
export interface TeamBreakdownRow {
  teamId: string;
  teamName: string;
  P: number; A: number; L: number; M: number; S: number;
  RGI: number; RGO: number; RRI: number; RRO: number;
  V: number; oneToOne: number; CEU: number; T: number; TYFCB_amount: number;
  totalPoints: number;
  captainFullName?: string | null;
}

export async function fetchTeamBreakdown(): Promise<TeamBreakdownRow[]> {
  return apiRequest<TeamBreakdownRow[]>(`${API_BASE}/dashboard/team-breakdown`);
}

export async function uploadUsersCsv(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return apiRequest<any>(`${API_BASE}/users/upload-csv`, {
    method: "POST",
    body: fd
  });
}

// Download sample users Excel (.xls) file
export async function downloadUsersSampleXls() {
  const blob = await apiRequest<Blob>(`${API_BASE}/users/sample-xls`, {
    method: "GET"
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample-users.xls";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// Teams
export async function createTeam(name: string, userIds: string[]) {
  return apiRequest<any>(`${API_BASE}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, userIds })
  });
}

export async function fetchTeams() {
  return apiRequest<any[]>(`${API_BASE}/teams`);
}

export async function updateTeam(id: string, payload: { name?: string; userIds?: string[]; captainUserId?: string | null }) {
  return apiRequest<any>(`${API_BASE}/teams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function deleteTeam(id: string) {
  return apiRequest<{ deletedTeamId: string }>(`${API_BASE}/teams/${id}`, {
    method: 'DELETE'
  });
}

// Reports
export async function uploadWeeklyReport(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return apiRequest<any>(`${API_BASE}/reports/upload-weekly`, {
    method: "POST",
    body: fd
  });
}

// Enhanced: upload multiple CSVs with explicit week start/end dates
export async function uploadWeeklyReports(
  files: File[],
  weekStartDate: string,
  weekEndDate: string
) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  fd.append("weekStartDate", weekStartDate);
  fd.append("weekEndDate", weekEndDate);
  return apiRequest<any>(`${API_BASE}/reports/upload-weekly`, {
    method: "POST",
    body: fd
  });
}

export interface WeeklyReportSummary {
  _id: string;
  weekStartDate: string;
  weekEndDate: string;
  uploadedAt: string;
}

export async function fetchWeeklyReports(): Promise<WeeklyReportSummary[]> {
  return apiRequest<WeeklyReportSummary[]>(`${API_BASE}/reports/weekly`);
}

export async function deleteWeeklyReport(id: string) {
  return apiRequest<{ deletedWeekId: string; deletedStats: number }>(`${API_BASE}/reports/weekly/${id}`, {
    method: "DELETE"
  });
}