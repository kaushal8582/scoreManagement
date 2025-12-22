"use client";

import { useEffect, useState } from "react";
import { fetchWeeklyReports, deleteWeeklyReport, type WeeklyReportSummary } from "../lib/api";

export default function WeeklyReports() {
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(user);
  }, []);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const reports = await fetchWeeklyReports();
      setWeeklyReports(reports);
    } catch (err: any) {
      setError(err.message || "Failed to load weekly reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const handleDeleteReport = async (id: string) => {
    try {
      setDeletingId(id);
      setError(null);
      await deleteWeeklyReport(id);
      await loadReports();
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold sm:text-base">Weekly reports</h2>
          <p className="text-xs text-slate-500 sm:text-sm">Delete a wrong upload; stats recalculate automatically.</p>
        </div>
        <span className="text-xs text-slate-500">{loading ? 'Loading…' : `${weeklyReports.length} weeks`}</span>
      </div>
      {error && (
        <div className="mb-2 text-xs text-red-600">{error}</div>
      )}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white overflow-x-auto">
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
                    disabled={deletingId === w._id || user?.category === "guest"}

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
  );
}