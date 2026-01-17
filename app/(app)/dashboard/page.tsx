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
  const [monthYear, setMonthYear] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [user, setUser] = useState<any>({});
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(user);
  }, []);

  console.log("userbre", userBreakdown);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const monthYearFilter = selectedMonthYear || undefined;
        const [stats, teams, performers, totals, usersB, teamsB] =
          await Promise.all([
            fetchTeamStatsByWeek(monthYearFilter),
            fetchTopTeams(3, monthYearFilter),
            fetchTopPerformers(3, monthYearFilter),
            fetchCategoryTotals(monthYearFilter),
            fetchUserBreakdown(7, undefined, monthYearFilter),
            fetchTeamBreakdown(monthYearFilter),
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
  }, [selectedMonthYear]);

  const handleCsvSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  const handleUploadSubmit = async () => {
    if (!weekStartDate || !weekEndDate || !monthYear || selectedFiles.length === 0) return;
    try {
      setError(null);
      setUploadingReport(true);
      await uploadWeeklyReports(selectedFiles, weekStartDate, weekEndDate, monthYear);
      // Refresh ALL dashboard data to reflect upload everywhere
      const monthYearFilter = selectedMonthYear || undefined;
      const [stats, teams, performers, totals, usersB, teamsB] =
        await Promise.all([
          fetchTeamStatsByWeek(monthYearFilter),
          fetchTopTeams(3, monthYearFilter),
          fetchTopPerformers(3, monthYearFilter),
          fetchCategoryTotals(monthYearFilter),
          fetchUserBreakdown(7, undefined, monthYearFilter),
          fetchTeamBreakdown(monthYearFilter),
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
      setMonthYear("");
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
          {/* Month/Year Filter */}
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
              value={selectedMonthYear ? selectedMonthYear.split('-')[1] || '' : ''}
              onChange={(e) => {
                const month = e.target.value;
                if (month) {
                  // If month is selected but no year yet, set default year to 2026
                  const year = selectedMonthYear ? selectedMonthYear.split('-')[0] : '2026';
                  setSelectedMonthYear(`${year}-${month}`);
                } else {
                  setSelectedMonthYear('');
                }
              }}
            >
              <option value="">Weekly</option>
              <option value="01">Jan</option>
              <option value="02">Feb</option>
              <option value="03">Mar</option>
              <option value="04">Apr</option>
              <option value="05">May</option>
              <option value="06">Jun</option>
              <option value="07">Jul</option>
              <option value="08">Aug</option>
              <option value="09">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
            {selectedMonthYear && selectedMonthYear.split('-')[1] && (
              <select
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
                value={selectedMonthYear ? selectedMonthYear.split('-')[0] || '' : ''}
                onChange={(e) => {
                  const year = e.target.value;
                  const month = selectedMonthYear ? selectedMonthYear.split('-')[1] : '';
                  if (year && month) {
                    setSelectedMonthYear(`${year}-${month}`);
                  } else if (!year) {
                    setSelectedMonthYear('');
                  }
                }}
              >
                <option value="">Year</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            )}
            {selectedMonthYear && (
              <button
                className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded border border-gray-300"
                onClick={() => setSelectedMonthYear('')}
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
          {user?.category!="guest" && <button
            className="rounded-md border text-black border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-60"
            onClick={() => setUploadModalOpen(true)}
            disabled={uploadingReport}
          >
            Upload Weekly Reports
          </button>}
          
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

      {loading ? (
        <div>
          <div className="flex items-center min-h-[80vh] justify-center gap-2">
            <div className="animate-spin rounded-full border-4 border-solid border-gray-300 border-t-transparent h-8 w-8"></div>
            <div className="text-sm font-medium text-gray-700">Loading...</div>
          </div>
        </div>
      ) : (
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
      )}

      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-red-50 to-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Upload Weekly Reports</h2>
                  <p className="mt-1 text-xs text-gray-500">Upload Excel files for weekly performance tracking</p>
                </div>
                <button
                  onClick={() => {
                    if (!uploadingReport) {
                      setUploadModalOpen(false);
                      setSelectedFiles([]);
                      setWeekStartDate("");
                      setWeekEndDate("");
                      setMonthYear("");
                      setError(null);
                    }
                  }}
                  disabled={uploadingReport}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-5">
                {/* Week Date Range */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Week Date Range <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="date"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        value={weekStartDate}
                        onChange={(e) => setWeekStartDate(e.target.value)}
                        disabled={uploadingReport}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Start Date</p>
                    </div>
                    <div className="">
                      <span className="text-sm font-medium text-gray-400">to</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="date"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        value={weekEndDate}
                        onChange={(e) => setWeekEndDate(e.target.value)}
                        disabled={uploadingReport}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">End Date</p>
                    </div>
                  </div>
                </div>

                {/* Month/Year */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Month & Year <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <select
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        value={monthYear ? monthYear.split('-')[1] || '' : ''}
                        onChange={(e) => {
                          const month = e.target.value;
                          const year = monthYear ? monthYear.split('-')[0] : new Date().getFullYear().toString();
                          if (month) {
                            setMonthYear(`${year}-${month}`);
                          } else {
                            setMonthYear('');
                          }
                        }}
                        disabled={uploadingReport}
                        required
                      >
                        <option value="">Select Month</option>
                        <option value="01">January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <select
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        value={monthYear ? monthYear.split('-')[0] || '' : ''}
                        onChange={(e) => {
                          const year = e.target.value;
                          const month = monthYear ? monthYear.split('-')[1] : (new Date().getMonth() + 1).toString().padStart(2, '0');
                          if (year) {
                            setMonthYear(`${year}-${month}`);
                          } else {
                            setMonthYear('');
                          }
                        }}
                        disabled={uploadingReport}
                        required
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 20 }, (_, i) => {
                          const year = new Date().getFullYear() - 10 + i;
                          return (
                            <option key={year} value={year.toString()}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Upload Files <span className="text-red-500">*</span>
                  </label>
                  <label
                    className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition hover:border-red-400 hover:bg-red-50/50 ${
                      uploadingReport ? "cursor-not-allowed opacity-60" : ""
                    } ${selectedFiles.length > 0 ? "border-red-400 bg-red-50/30" : ""}`}
                  >
                    <input
                      type="file"
                      accept=".xls,.xlsx,.csv"
                      multiple
                      className="hidden"
                      disabled={uploadingReport}
                      onChange={handleCsvSelect}
                    />
                    <div className="flex flex-col items-center">
                      <svg
                        className={`mb-3 h-12 w-12 ${selectedFiles.length > 0 ? "text-red-500" : "text-gray-400 group-hover:text-red-500"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-1 text-sm font-medium text-gray-700">
                        {selectedFiles.length > 0
                          ? `${selectedFiles.length} file(s) selected`
                          : "Click to upload "}
                      </p>
                      <p className="text-xs text-gray-500">
                        Excel files (.xls, .xlsx) 
                      </p>
                      {selectedFiles.length > 0 && (
                        <div className="mt-3 max-h-32 w-full space-y-1 overflow-y-auto rounded-lg bg-white p-2 text-left">
                          {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 rounded bg-gray-100 px-2 py-1 text-xs">
                              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="truncate text-gray-700">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (!uploadingReport) {
                      setUploadModalOpen(false);
                      setSelectedFiles([]);
                      setWeekStartDate("");
                      setWeekEndDate("");
                      setMonthYear("");
                      setError(null);
                    }
                  }}
                  disabled={uploadingReport}
                >
                  Cancel
                </button>
                <button
                  className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={handleUploadSubmit}
                  disabled={
                    uploadingReport ||
                    !weekStartDate ||
                    !weekEndDate ||
                    !monthYear ||
                    selectedFiles.length === 0
                  }
                >
                  {uploadingReport ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-5.291z"
                        />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Reports
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top teams – show three category circle charts like See more page */}
      {loading ? null : (
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
                  <div className="text-sm font-semibold text-green-700">
                    Total Points: {t.totalPoints.toLocaleString()}
                  </div>
                </div>
                <CircleChart
                  className="flex-col"
                  data={(() => {
                    // ===== POINT CALCULATIONS (same as boxes) =====
                    const attendancePointsRaw =
                      (t.P  + t.S) * 2 + t.A * -2+t.M * -2;

                    const referralsGivenPoints = (t.RGI + t.RGO)*5;
                    const referralsReceivedPoints = (t.RRI + t.RRO) * 5;

                    const visitorsPoints = t.V * 10;
                    const oneToOnePoints = t.oneToOne * 5;

                    const tyfcbPoints = Number(
                      ((t.TYFCB_amount || 0) / 10000).toFixed(2)
                    );

                    const trainingPoints = t.TR * 15;
                    const testimonialsPoints = t.T * 5;

                    return [
                      { label: "Attendance", value: attendancePointsRaw },
                      { label: "Visitors", value: visitorsPoints },
                      { label: "Referrals", value: referralsGivenPoints },
                      // {
                      //   label: "Referrals Received",
                      //   value: referralsReceivedPoints,
                      // },
                      { label: "Conversion", value: t.CON * 25 },
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
      )}

      {/* Top performers – full width stacked bar */}
      {loading ? null : (
        <section className="card p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
            Top 7 performers
          </h2>
           <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => (window.location.href = "/settings")}
          >
            Show all
          </button>
        </div>
        <BuildingChart
          data={userBreakdown.map((item) => {
            // ===== ATTENDANCE (Medical = -2) =====
            const attendancePoints =
              (item.P + item.S) * 2 + // present-like
              item.M * -2 + // medical = -2
              item.A * -2; // absent = -2

            // ===== OTHER POINTS =====
            const referralsPoints = (item.RGI + item.RGO)*5;

            const visitorPoints = item.V * 10;
            const oneToOnePoints = item.oneToOne * 5;

            const trainingPoints = item.TR * 15;
            const testimonialPoints = item.T * 5;

            const tyfcbPoints = Number(
              ((item.TYFCB_amount || 0) / 10000).toFixed(2)
            );

            // ===== TOTAL =====
            const totalPoints =
              attendancePoints +
              referralsPoints +
              visitorPoints +
              oneToOnePoints +
              trainingPoints +
              testimonialPoints +
              tyfcbPoints;

            return {
              name: item.fullName,

              // ✅ ONLY 8 FIELDS
              Attendance: attendancePoints,
              Visitors: visitorPoints,
              Referrals: referralsPoints,
              "121": oneToOnePoints,
              TYFCB: tyfcbPoints,
              Training: trainingPoints,
              Testimonials: testimonialPoints,
              Conversion: item.CON * 25,
              totalPoints: totalPoints,
            };
          })}
        />
      </section>
      )}



      {/* Weekly reports moved to Settings > Weekly tab as requested */}
    </div>
  );
}
