"use client";

import { useEffect, useState } from "react";
import { type Timeframe } from "../../../data/mockData";
import { TeamPerformanceChart } from "../../../components/TeamPerformanceChart";
import {
  fetchTeamStatsByWeek,
  fetchTopTeams,
  fetchTopPerformers,
  uploadWeeklyReports,
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
  const [topTeamsData, setTopTeamsData] = useState<{ team: string; totalPoints: number,captain?: string | null }[]>([]);
  const [topPerformersData, setTopPerformersData] = useState<{
    user: string;
    team: string;
    totalPoints: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<string>("");
  const [weekEndDate, setWeekEndDate] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [stats, teams, performers] = await Promise.all([
          fetchTeamStatsByWeek(),
          fetchTopTeams(3),
          fetchTopPerformers(3)
        ]);
        if (!mounted) return;
        setPerformanceData(stats);
        setTopTeamsData(teams);
        setTopPerformersData(performers);
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

  const handleCsvSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  const handleUploadSubmit = async () => {
    if (!weekStartDate || !weekEndDate || selectedFiles.length === 0) return;
    try {
      setError(null);
      setUploadingReport(true);
      await uploadWeeklyReports(selectedFiles, weekStartDate, weekEndDate);
      // Refresh dashboard data
      const [stats, teams, performers] = await Promise.all([
        fetchTeamStatsByWeek(),
        fetchTopTeams(3),
        fetchTopPerformers(3)
      ]);
      setPerformanceData(stats);
      setTopTeamsData(teams);
      setTopPerformersData(performers);
      setSelectedFiles([]);
      setWeekStartDate("");
      setWeekEndDate("");
      setUploadModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploadingReport(false);
    }
  };

  // Weekly reports deletion is handled inside the shared component

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl text-[#DC2627]">
           Dashboard
          </h1>
          {/* <p className="mt-1 text-sm text-gray-500">
            Track how teams and individuals are performing over time.
          </p> */}
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
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-60"
            onClick={() => setUploadModalOpen(true)}
            disabled={uploadingReport}
          >
            Upload Weekly Reports
          </button>
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

      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-lg bg-white p-4 text-gray-900 shadow-xl">
            <div className="mb-2 text-sm font-semibold">Upload weekly reports</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="date"
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                disabled={uploadingReport}
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="date"
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
                value={weekEndDate}
                onChange={(e) => setWeekEndDate(e.target.value)}
                disabled={uploadingReport}
              />
            </div>
            <div className="mt-3">
              <label className={`btn-ghost cursor-pointer border border-dashed border-gray-300 text-xs sm:text-sm ${uploadingReport ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <span>{selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Select CSV files'}</span>
                <input
                  type="file"
                  accept=".csv"
                  multiple
                  className="hidden"
                  disabled={uploadingReport}
                  onChange={handleCsvSelect}
                />
              </label>
            </div>
            {error && (
              <div className="mt-2 text-xs text-red-600">{error}</div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                onClick={() => { if (!uploadingReport) setUploadModalOpen(false); }}
                disabled={uploadingReport}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-brand-600 px-3 py-1 text-sm text-white disabled:opacity-60"
                onClick={handleUploadSubmit}
                disabled={uploadingReport || !weekStartDate || !weekEndDate || selectedFiles.length === 0}
              >
                {uploadingReport ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              Top 3 teams
            </h2>
            <span className="text-xs text-gray-500">Total Score</span>
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
                  <div >
                    <div className="font-medium">
                      {team.team}
                    </div>
                      {team.captain ? (
                        <span className=" text-xs text-gray-500">Captain: {team.captain}</span>
                      ) : null}
                    {/* <div className="text-xs text-gray-500">Total points</div> */}
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
            <span className="text-xs text-gray-500">Total Score</span>
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
                    {/* <span>Total points</span> */}
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

      {/* Weekly reports moved to Settings > Weekly tab as requested */}
    </div>
  );
}


