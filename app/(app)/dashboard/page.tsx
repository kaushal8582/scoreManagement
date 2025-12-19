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
  type WeeklyReportSummary,
  fetchCategoryTotals,
  fetchUserBreakdown,
  fetchTeamBreakdown,
} from "../../../lib/api";
import { BuildingChart } from "../../../components/BuildingChart";
import { CircleChart } from "../../../components/CircleChart";
import SummaryBoxes from "../../../components/SummayBox";
// import { CircleChart } from "../../../components/CircleChart";

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");

  const [performanceData, setPerformanceData] = useState<
    {
      week: string;
      team: string;
      points: number;
    }[]
  >([]);
  const [topTeamsData, setTopTeamsData] = useState<
    { team: string; totalPoints: number; captain?: string | null }[]
  >([]);
  const [topPerformersData, setTopPerformersData] = useState<
    {
      user: string;
      team: string;
      totalPoints: number;
    }[]
  >([]);
  const [categoryTotals, setCategoryTotals] = useState<{
    P: number;
    A: number;
    L: number;
    M: number;
    S: number;
    RGI: number;
    RGO: number;
    RRI: number;
    RRO: number;
    V: number;
    oneToOne: number;
    CEU: number;
    T: number;
    TYFCB_amount: number;
    totalPoints: number;
  } | null>(null);
  const [userBreakdown, setUserBreakdown] = useState<any[]>([]);
  const [teamBreakdown, setTeamBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<string>("");
  const [weekEndDate, setWeekEndDate] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  console.log("userbre", userBreakdown);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [stats, teams, performers, totals, usersB, teamsB] =
          await Promise.all([
            fetchTeamStatsByWeek(),
            fetchTopTeams(3),
            fetchTopPerformers(3),
            fetchCategoryTotals(),
            fetchUserBreakdown(7),
            fetchTeamBreakdown(),
          ]);
        if (!mounted) return;
        setPerformanceData(stats);
        setTopTeamsData(teams);
        setTopPerformersData(performers);
        setCategoryTotals(totals as any);
        setUserBreakdown(usersB as any);
        setTeamBreakdown(teamsB as any);
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
      // Refresh ALL dashboard data to reflect upload everywhere
      const [stats, teams, performers, totals, usersB, teamsB] =
        await Promise.all([
          fetchTeamStatsByWeek(),
          fetchTopTeams(3),
          fetchTopPerformers(3),
          fetchCategoryTotals(),
          fetchUserBreakdown(7),
          fetchTeamBreakdown(),
        ]);
      setPerformanceData(stats);
      setTopTeamsData(teams);
      setTopPerformersData(performers);
      setCategoryTotals(totals as any);
      setUserBreakdown(usersB as any);
      setTeamBreakdown(teamsB as any);
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
            {/* <button
              className={`flex-1 rounded-full px-3 py-1 transition ${
                timeframe === "monthly"
                  ? "bg-brand-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setTimeframe("monthly")}
            >
              Monthly
            </button> */}
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
      {categoryTotals && (
        <section className="card p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              Overall Stats
            </h2>
            <span className="badge bg-green-100 text-green-700">
              {loading ? "Loading…" : error ? "Error" : "Live data"}
            </span>
          </div>
          {/* <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {[
              { k: "P", label: "Present", tooltip: "Present" },
              { k: "A", label: "Absent", tooltip: "Absent" },
              { k: "L", label: "Late", tooltip: "Late" },
              { k: "M", label: "Medical", tooltip: "Medical" },
              { k: "S", label: "Substitute", tooltip: "Substitute" },
              { k: "RGI", label: "RGI", tooltip: "Referrals Given Inside" },
              { k: "RGO", label: "RGO", tooltip: "Referrals Given Outside" },
              { k: "RRI", label: "RRI", tooltip: "Referrals Received Inside" },
              { k: "RRO", label: "RRO", tooltip: "Referrals Received Outside" },
              { k: "V", label: "Visitors", tooltip: "Visitors" },
              { k: "oneToOne", label: "1-2-1", tooltip: "One to One Meetings Held" },
              { k: "TYFCB_amount", label: "TYFCB", tooltip: "Thank You For Closed Business" },
              { k: "CEU", label: "CEU", tooltip: "Chapter Education Units" },
              { k: "T", label: "Testimonials", tooltip: "Testimonials" },
            ].map((item) => (
              <div
                key={item.k}
                className="rounded-md border border-gray-200 bg-white p-3"
              >
                <div className="relative group text-xs text-gray-500 ">
                  {item.label}

                  <div className="absolute hidden group-hover:block -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded bg-black px-2 py-1 text-xs text-white whitespace-nowrap">
                    {item.tooltip}
                  </div>
                </div>

                <div className="mt-1 text-sm font-semibold text-green-700">
                  {(categoryTotals as any)[item.k]?.toLocaleString?.() ??
                    (categoryTotals as any)[item.k]}
                </div>
              </div>
            ))}
          </div> */}
          <SummaryBoxes values={categoryTotals} />
        </section>
      )}

      <section className="card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              Power Team performance
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Total points per team by{" "}
              {timeframe === "weekly" ? "week" : "month"}.
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
            <div className="mb-2 text-sm font-semibold">
              Upload weekly reports
            </div>
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
              <label
                className={`btn-ghost cursor-pointer border border-dashed border-gray-300 text-xs sm:text-sm ${
                  uploadingReport ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <span>
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected`
                    : "Select Excel/CSV files"}
                </span>
                <input
                  type="file"
                  accept=".xls,.xlsx,.csv"
                  multiple
                  className="hidden"
                  disabled={uploadingReport}
                  onChange={handleCsvSelect}
                />
              </label>
            </div>
            {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                className={`rounded-md border border-gray-300 bg-white px-3 py-1 text-sm ${
                  uploadingReport ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (!uploadingReport) setUploadModalOpen(false);
                }}
                // disabled={uploadingReport}'
                disabled={uploadingReport}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-brand-600 px-3 py-1 text-sm text-white disabled:opacity-60"
                onClick={handleUploadSubmit}
                disabled={
                  uploadingReport ||
                  !weekStartDate ||
                  !weekEndDate ||
                  selectedFiles.length === 0
                }
              >
                {uploadingReport ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top teams – show three category circle charts like See more page */}
      <section className="card p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
            Top 3 teams
          </h2>
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => (window.location.href = "/power-teams")}
          >
            Show all
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(teamBreakdown || [])
            .slice()
            .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
            .slice(0, 3)
            .map((t: any) => (
              <div
                key={t.teamId}
                className="rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm flex flex-col font-semibold text-gray-900">
                    {t.teamName}
                    <span className="text-xs text-gray-500">
                      Captain : {t.captainFullName}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Points: {t.totalPoints.toLocaleString()}
                  </div>
                </div>
                <CircleChart
                  className="flex-col"
                  data={(() => {
                    // ===== POINT CALCULATIONS (same as boxes) =====
                    const attendancePointsRaw =
                      (t.P + t.L + t.M + t.S) * 2 + t.A * -2;

                    const referralsGivenPoints = (t.RGI + t.RGO) * 5;
                    const referralsReceivedPoints = (t.RRI + t.RRO) * 5;

                    const visitorsPoints = t.V * 10;
                    const oneToOnePoints = t.oneToOne * 5;

                    const tyfcbPoints =
                      Math.floor((t.TYFCB_amount || 0) / 1000) * 1;

                    const trainingPoints = t.CEU * 5;
                    const testimonialsPoints = t.T * 5;

                    return [
                      { label: "Attendance", value: attendancePointsRaw },
                      { label: "Visitors", value: visitorsPoints },
                      { label: "Referrals", value: referralsGivenPoints },
                      // {
                      //   label: "Referrals Received",
                      //   value: referralsReceivedPoints,
                      // },
                      { label: "Conversion", value: t.CON },
                      { label: "1-2-1", value: oneToOnePoints },
                      { label: "TYFCB", value: tyfcbPoints },
                      { label: "Training", value: trainingPoints },
                      { label: "Testimonials", value: testimonialsPoints },
                    ];
                  })()}
                />
              </div>
            ))}
        </div>
      </section>

      {/* Top performers – full width stacked bar */}
      <section className="card p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
            Top 7 performers
          </h2>
          {/* <span className="text-xs text-gray-500">Stacked by category</span> */}
        </div>
        <BuildingChart
          data={userBreakdown.map((item) => {
            const presentPoints = (item.P + item.L + item.M + item.S) * 2;
            const absentPoints = item.A * -2;
            const referralPoints =
              (item.RGI + item.RGO + item.RRI + item.RRO) * 5;
            const visitorPoints = item.V * 10;
            const oneToOnePoints = item.oneToOne * 5; // 121
            const testimonialPoints = item.CEU * 5;
            const trainingPoints = item.T * 5;
            const tyfcbPoints = Math.floor((item.TYFCB_amount || 0) / 1000) * 1;

            const computedTotal =
              presentPoints +
              absentPoints +
              referralPoints +
              visitorPoints +
              oneToOnePoints +
              testimonialPoints +
              trainingPoints +
              tyfcbPoints;

            return {
              name: item.fullName,
              P: presentPoints,
              A: absentPoints,
              L: 0,
              M: 0,
              S: 0,
              RGI: item.RGI * 5,
              RGO: item.RGO * 5,
              RRI: item.RRI * 5,
              RRO: item.RRO * 5,
              V: visitorPoints,
              121: oneToOnePoints,
              CEU: testimonialPoints,
              T: trainingPoints,
              TYFCB: tyfcbPoints,
              totalPoints: computedTotal,
            };
          })}
        />
      </section>

      {/* Weekly reports moved to Settings > Weekly tab as requested */}
    </div>
  );
}
