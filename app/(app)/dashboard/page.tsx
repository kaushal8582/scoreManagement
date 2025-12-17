"use client";

import { useEffect, useState } from "react";
import { type Timeframe } from "../../../data/mockData";
import { TeamPerformanceChart } from "../../../components/TeamPerformanceChart";
import {
  fetchTeamStatsByWeek,
  fetchTopTeams,
  fetchTopPerformers,
  uploadWeeklyReport,
  fetchWeeklyReports,
  deleteWeeklyReport,
  type WeeklyReportSummary
} from "../../../lib/api";

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");

  const [performanceData, setPerformanceData] = useState<{
    week: string;
    team: string;
    points: number;
  }[]>([]);
  const [topTeamsData, setTopTeamsData] = useState<{ team: string; totalPoints: number }[]>([]);
  const [topPerformersData, setTopPerformersData] = useState<{
    user: string;
    team: string;
    totalPoints: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReportSummary[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [stats, teams, performers, reports] = await Promise.all([
          fetchTeamStatsByWeek(),
          fetchTopTeams(3),
          fetchTopPerformers(3),
          fetchWeeklyReports()
        ]);
        if (!mounted) return;
        setPerformanceData(stats);
        setTopTeamsData(teams);
        setTopPerformersData(performers);
        setWeeklyReports(reports);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setError(null);
      setUploadingReport(true);
      await uploadWeeklyReport(file);
      // Refresh dashboard data
      const [stats, teams, performers, reports] = await Promise.all([
        fetchTeamStatsByWeek(),
        fetchTopTeams(3),
        fetchTopPerformers(3),
        fetchWeeklyReports()
      ]);
      setPerformanceData(stats);
      setTopTeamsData(teams);
      setTopPerformersData(performers);
      setWeeklyReports(reports);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    }
    finally {
      setUploadingReport(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      setDeletingId(id);
      setError(null);
      await deleteWeeklyReport(id);
      const [stats, teams, performers, reports] = await Promise.all([
        fetchTeamStatsByWeek(),
        fetchTopTeams(3),
        fetchTopPerformers(3),
        fetchWeeklyReports()
      ]);
      setPerformanceData(stats);
      setTopTeamsData(teams);
      setTopPerformersData(performers);
      setWeeklyReports(reports);
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl text-gray-900">
            Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track how teams and individuals are performing over time.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white p-1 text-xs font-medium text-gray-700 sm:text-sm">
            <button
              className={`flex-1 rounded-full px-3 py-1 transition ${
                timeframe === "weekly"
                  ? "bg-brand-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setTimeframe("weekly")}
            >
              Weekly
            </button>
            <button
              className={`flex-1 rounded-full px-3 py-1 transition ${
                timeframe === "monthly"
                  ? "bg-brand-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setTimeframe("monthly")}
            >
              Monthly
            </button>
          </div>
          <label className={`btn-ghost cursor-pointer border border-dashed border-gray-300 text-xs sm:text-sm ${uploadingReport ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <span>{uploadingReport ? 'Uploading…' : 'Upload weekly report CSV'}</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              disabled={uploadingReport}
              onChange={handleCsvUpload}
            />
          </label>
        </div>
      </section>

      <section className="card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              Team performance
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Total points per team by {timeframe === "weekly" ? "week" : "month"}.
            </p>
          </div>
          <span className="badge bg-green-100 text-green-700">
            {loading ? "Loading…" : error ? "Error" : "Live data"}
          </span>
        </div>
        <TeamPerformanceChart data={performanceData} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              Top 3 teams
            </h2>
            <span className="text-xs text-gray-500">This period</span>
          </div>
          <ul className="divide-y divide-gray-200 text-sm">
            {topTeamsData.map((team, index) => (
              <li
                key={team.team}
                className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-800">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{team.team}</div>
                    <div className="text-xs text-gray-500">Total points</div>
                  </div>
                </div>
                <div className="text-right text-sm font-semibold text-green-700">
                  {team.totalPoints.toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              Top 3 performers
            </h2>
            <span className="text-xs text-gray-500">This period</span>
          </div>
          <ul className="divide-y divide-gray-200 text-sm">
            {topPerformersData.map((perf) => (
              <li
                key={perf.user}
                className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              >
                <div>
                  <div className="font-medium">{perf.user}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                    <span className="badge bg-gray-200 text-gray-800">
                      {perf.team}
                    </span>
                    <span>Total points</span>
                  </div>
                </div>
                <div className="text-right text-sm font-semibold text-green-700">
                  {perf.totalPoints.toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold sm:text-base">Weekly reports</h2>
            <p className="text-xs text-slate-500 sm:text-sm">Delete a wrong upload; stats recalculate automatically.</p>
          </div>
          <span className="text-xs text-slate-500">{weeklyReports.length} weeks</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Week start</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Week end</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Uploaded</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {weeklyReports.map((w) => (
                <tr key={w._id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">{new Date(w.weekStartDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{new Date(w.weekEndDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{new Date(w.uploadedAt).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                      disabled={deletingId === w._id}
                      onClick={() => handleDeleteReport(w._id)}
                    >
                      {deletingId === w._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


