"use client";

import { useEffect, useState } from "react";
import {
  fetchUsers,
  uploadUsersCsv,
  createTeam,
  fetchTeams,
  fetchUserTotals,
  deleteTeam,
  updateTeam,
  downloadUsersSampleXls,
} from "../../../lib/api";
import WeeklyReports from "../../../components/WeeklyReports";

type TabKey = "upload" | "teams" | "weekly" | "points";

interface UserOption {
  value: string;
  label: string;
  category: string;
}
interface UserRow {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  category?: string;
  teamId?: { name?: string } | null;
}
interface TeamRow {
  _id: string;
  name: string;
  users: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    category?: string;
  }[];
  captainUserId?: { _id: string; fullName: string } | null;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upload");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [teamName, setTeamName] = useState("");
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingUsers, setUploadingUsers] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [totalsByUserId, setTotalsByUserId] = useState<Record<string, number>>(
    {}
  );
  const [captainModalTeamId, setCaptainModalTeamId] = useState<string | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalTeamId, setDeleteModalTeamId] = useState<string | null>(
    null
  );
  const [selectedCaptainUserId, setSelectedCaptainUserId] = useState<
    string | null
  >(null);
  const [deleteTeamLoading, setDeleteTeamLoading] = useState(false);
  const [savingCaptainLoading, setSavingCaptainLoading] = useState(false);
  const [editModalTeamId, setEditModalTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState<string>("");
  const [editingTeamUserIds, setEditingTeamUserIds] = useState<string[]>([]);
  const [originalTeamName, setOriginalTeamName] = useState<string>("");
  const [originalTeamUserIds, setOriginalTeamUserIds] = useState<string[]>([]);
  const [updatingTeam, setUpdatingTeam] = useState(false);
  const pageSize = 100;
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(user);
  }, []);
  

  useEffect(() => {
    let mounted = true;
    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const usersData = await fetchUsers();
        const teamsData = await fetchTeams();
        const totals = await fetchUserTotals();
        if (!mounted) return;
        setUsers(usersData as any);
        setTeams(teamsData as any);

        // conos
        setUserOptions(
          usersData
            .filter((u) => (u.category ?? "").toLowerCase() !== "admin" && (u.category ?? "").toLowerCase() !== "guest")
            .map((u) => ({
              value: u._id,
              label: `${u.firstName} ${u.lastName}`,
              category: u.category || "",
            }))
        );

        const totalsMap: Record<string, number> = {};
        totals.forEach((t) => {
          totalsMap[t.userId] = t.totalPoints;
        });
        setTotalsByUserId(totalsMap);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUserCsvUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setError(null);
      setUploadingUsers(true);
      await uploadUsersCsv(file);
      // Reload users after upload
      const usersData = await fetchUsers();
      const totals = await fetchUserTotals();
      setUsers(usersData as any);
      setCurrentPage(1);
      setUserOptions(
        usersData
          .filter((u) => (u.category ?? "").toLowerCase() !== "admin" && (u.category ?? "").toLowerCase() !== "guest")
          .map((u) => ({
            value: u._id,
            label: `${u.firstName} ${u.lastName}`,
            category: u.category || "",
          }))
      );

      const totalsMap: Record<string, number> = {};
      totals.forEach((t) => {
        totalsMap[t.userId] = t.totalPoints;
      });
      setTotalsByUserId(totalsMap);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploadingUsers(false);
    }
  };

  const handleTeamSave = async () => {
    if (!teamName) return;
    try {
      setError(null);
      setCreatingTeam(true);
      await createTeam(teamName, selectedUserIds);
      const teamsData = await fetchTeams();
      const usersData = await fetchUsers();
      const totals = await fetchUserTotals();
      setUsers(usersData as any);

      setTeams(teamsData as any);
      setTeamName("");
      setSelectedUserIds([]);
    } catch (err: any) {
      setError(err.message || "Failed to create team");
    } finally {
      setCreatingTeam(false);
    }
  };

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      setDeleteTeamLoading(true);
      await deleteTeam(id);
      const teamsData = await fetchTeams();
      const usersData = await fetchUsers();
      const totals = await fetchUserTotals();
      const totalsMap: Record<string, number> = {};
      totals.forEach((t) => {
        totalsMap[t.userId] = t.totalPoints;
      });
      setUsers(usersData as any);
      setTeams(teamsData as any);
      setDeleteModalOpen(false);
      setDeleteModalTeamId(null);
      setDeleteTeamLoading(false);
    } catch (err: any) {
      setDeleteTeamLoading(false);
      setError(err.message || "Failed to delete team");
    }
  };

  const openCaptainModal = (teamId: string) => {
    setCaptainModalTeamId(teamId);
    setSelectedCaptainUserId(null);
  };

  const saveCaptain = async () => {
    if (!captainModalTeamId) return;
    setSavingCaptainLoading(true);
    try {
      await updateTeam(captainModalTeamId, {
        captainUserId: selectedCaptainUserId ?? null,
      });
      const teamsData = await fetchTeams();
      const usersData = await fetchUsers();
      const totals = await fetchUserTotals();
      const totalsMap: Record<string, number> = {};
      totals.forEach((t) => {
        totalsMap[t.userId] = t.totalPoints;
      });
      setUsers(usersData as any);
      setTeams(teamsData as any);
      setSavingCaptainLoading(false);
    } catch (err: any) {
      setSavingCaptainLoading(false);
      setError(err.message || "Failed to set captain");
    } finally {
      setCaptainModalTeamId(null);
      setSelectedCaptainUserId(null);
    }
  };

  const openEditModal = (team: TeamRow) => {
    setEditModalTeamId(team._id);
    setEditingTeamName(team.name);
    setEditingTeamUserIds(team.users.map(u => u._id));
    // Store original values to compare later
    setOriginalTeamName(team.name);
    setOriginalTeamUserIds(team.users.map(u => u._id));
  };

  // Check if any changes were made
  const hasTeamChanges = () => {
    if (!editModalTeamId) return false;
    const nameChanged = editingTeamName !== originalTeamName;
    const membersChanged = 
      editingTeamUserIds.length !== originalTeamUserIds.length ||
      !editingTeamUserIds.every(id => originalTeamUserIds.includes(id)) ||
      !originalTeamUserIds.every(id => editingTeamUserIds.includes(id));
    return nameChanged || membersChanged;
  };

  const handleUpdateTeam = async () => {
    if (!editModalTeamId || !editingTeamName) return;
    setUpdatingTeam(true);
    try {
      await updateTeam(editModalTeamId, {
        name: editingTeamName,
        userIds: editingTeamUserIds,
      });
      const teamsData = await fetchTeams();
      const usersData = await fetchUsers();
      const totals = await fetchUserTotals();
      const totalsMap: Record<string, number> = {};
      totals.forEach((t) => {
        totalsMap[t.userId] = t.totalPoints;
      });
      setUsers(usersData as any);
      setTeams(teamsData as any);
      setEditModalTeamId(null);
      setEditingTeamName("");
      setEditingTeamUserIds([]);
      setOriginalTeamName("");
      setOriginalTeamUserIds([]);
      setUpdatingTeam(false);
    } catch (err: any) {
      setUpdatingTeam(false);
      setError(err.message || "Failed to update team");
    }
  };

  const toggleEditTeamUserSelection = (id: string) => {
    setEditingTeamUserIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const filteredUsers = users.filter((u) => {
    // ❌ admin users hide
    if ((u.category ?? "").toLowerCase() === "admin" || (u.category ?? "").toLowerCase() === "guest") {
      return false;
    }

    const q = userSearch.trim().toLowerCase();
    if (!q) return true;

    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = (u.email ?? "").toLowerCase();
    const category = (u.category ?? "").toLowerCase();

    const teamName =
      typeof u.teamId === "object" && u.teamId?.name
        ? u.teamId.name.toLowerCase()
        : "";

    return (
      fullName.includes(q) ||
      email.includes(q) ||
      category.includes(q) ||
      teamName.includes(q)
    );
  });

  console.log("filteredUsers", filteredUsers);

  const filteredUserOptions = userOptions.filter((o) =>
    o.label.toLowerCase().includes(memberSearch.trim().toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col gap-6 text-black" >
      <section>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage members, teams, and weekly report for your dashboard.
        </p>
      </section>

      <section className="card p-4 sm:p-6">
        <div className="border-b border-slate-800">
          <nav className="flex gap-2 text-sm">
            <button
              className={`px-3 py-2 font-medium ${
                activeTab === "upload"
                  ? "border-b-2 border-brand-500 text-black"
                  : "text-black"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              Members
            </button>
            <button
              className={`px-3 py-2 font-medium ${
                activeTab === "teams"
                  ? "border-b-2 border-brand-500 text-black"
                  : "text-black"
              }`}
              onClick={() => setActiveTab("teams")}
            >
              Teams
            </button>
            <button
              className={`px-3 py-2 font-medium ${
                activeTab === "weekly"
                  ? "border-b-2 border-brand-500 text-black"
                  : "text-black"
              }`}
              onClick={() => setActiveTab("weekly")}
            >
              Weekly reports
            </button>
            <button
              className={`px-3 py-2 font-medium ${
                activeTab === "points"
                  ? "border-b-2 border-brand-500 text-black"
                  : "text-black"
              }`}
              onClick={() => setActiveTab("points")}
            >
              Points Calculations
            </button>
          </nav>
        </div>

        {activeTab === "upload" && (
          <div className="mt-4 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {/* Previous title preserved; commenting to avoid removal */}
                {/* <h2 className="text-sm font-semibold text-black sm:text-base">Upload users CSV</h2> */}
                <h2 className="text-sm font-semibold text-black sm:text-base">
                  Member List
                </h2>
                {/* <p className="text-xs text-slate-400 sm:text-sm">Import users with their basic details via CSV.</p> */}
                <p className="text-xs text-slate-400 sm:text-sm">
                  Import members with their basic details via Excel
                  (.xls/.xlsx).
                </p>
              </div>

              {user?.category !=="guest" && <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await downloadUsersSampleXls();
                    } catch (e) {
                      console.error(e);
                      alert("Failed to download sample .xls file");
                    }
                  }}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                >
                  Download Sample
                </button>
                <label className=" cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-50">
                  <span>
                    {uploadingUsers ? "Uploading…" : "Upload Excel  "}
                  </span>
                  <input
                    type="file"
                    accept=".xls,.xlsx,.csv"
                    className="hidden"
                    disabled={uploadingUsers}
                    onChange={handleUserCsvUpload}
                  />
                </label>
              </div> }
              
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {/* <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="
    w-full
    bg-white
    px-3
    py-[11px]
    text-black 
    border-0
    rounded-[3px]
    appearance-none
    border-b-[3px] border-b-[#DF2020]
    focus:border-b-[#DF2020]
    focus:border-b-[2px]
    
    focus:outline-none
  "
                    value={userSearch}
                     style={{
                // backgroundColor: "white",
                // padding: "11px",
                // borderRadius: "3px",
                // color: "black",
                // border: "0px",
                boxShadow:
                  "rgba(0, 0, 0, 0.3) 0px 1px 3px inset, rgb(255, 255, 255) 0px 0px 0px, rgb(255, 255, 255) 0px 0px 0px",
                appearance: "none",
                // borderBottom: "3px solid #DF2020",
              }}
                    onChange={(e) => { setUserSearch(e.target.value); setCurrentPage(1); }}
                  />
                  <span className="text-xs text-slate-500">
                    {loading ? "Loading…" : error ? "Error" : `${filteredUsers.length} users`}
                  </span>
                </div> */}
              </div>

                  {loading &&  <div>
          <div className="flex items-center min-h-[80vh] justify-center gap-2">
            <div className="animate-spin rounded-full border-4 border-solid border-gray-300 border-t-transparent h-8 w-8"></div>
            <div className="text-sm font-medium text-gray-700">Loading...</div>
          </div>
        </div>}

                    {loading ?null :(
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        First name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Last name
                      </th>
                      {/* <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Email</th> */}
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Category
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Team
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Total score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredUsers
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-sm">
                            {user.firstName}
                          </td>
                          <td className="px-3 py-2 text-sm">{user.lastName}</td>
                          {/* <td className="px-3 py-2 text-sm text-slate-700">{user.email ?? '-'}</td> */}
                          <td className="px-3 py-2 text-sm text-slate-700">
                            <span className="badge bg-slate-200 text-slate-800">
                              {user.category ?? "-"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {user.teamId && typeof user.teamId === "object"
                              ? user.teamId.name ?? "-"
                              : "-"}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {totalsByUserId[user._id]?.toFixed(2) ?? 0}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              )}
              
              <div className="flex items-center justify-between py-2 text-xs text-slate-600">
                <div>
                  Showing {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, filteredUsers.length)} of{" "}
                  {filteredUsers.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 disabled:opacity-60"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <button
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 disabled:opacity-60"
                    disabled={currentPage * pageSize >= filteredUsers.length}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
              
            </div>
          </div>
          
        )}

        {activeTab === "teams" && (
          <div className="mt-4 space-y-6">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-black sm:text-base">
                Team Listing
              </h2>
              <p className="text-xs text-slate-400 sm:text-sm">
                Group members into teams to compare performance across the BNI.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-black">
                  Team name
                </label>
                <input
                  type="text"
                  className="
    w-full
    bg-white
    px-3
    py-[11px]
    text-black 
    border-0
    rounded-[3px]
    appearance-none
    border-b-[3px] border-b-[#DF2020]
    focus:border-b-[#DF2020]
    focus:border-b-[2px]
    
    focus:outline-none
  "
                  placeholder="e.g. Alpha Squad"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  style={{
                    // backgroundColor: "white",
                    // padding: "11px",
                    // borderRadius: "3px",
                    // color: "black",
                    // border: "0px",
                    boxShadow:
                      "rgba(0, 0, 0, 0.3) 0px 1px 3px inset, rgb(255, 255, 255) 0px 0px 0px, rgb(255, 255, 255) 0px 0px 0px",
                    appearance: "none",
                    // borderBottom: "3px solid #DF2020",
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Members
                  </label>
                  <span className="text-xs text-slate-500">
                    Selected members: {selectedUserIds.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="
    w-full
    bg-white
    px-3
    py-[11px]
    text-black 
    border-0
    rounded-[3px]
    appearance-none
    border-b-[3px] border-b-[#DF2020]
    focus:border-b-[#DF2020]
    focus:border-b-[2px]
    
    focus:outline-none
  "
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    style={{
                      // backgroundColor: "white",
                      // padding: "11px",
                      // borderRadius: "3px",
                      // color: "black",
                      // border: "0px",
                      boxShadow:
                        "rgba(0, 0, 0, 0.3) 0px 1px 3px inset, rgb(255, 255, 255) 0px 0px 0px, rgb(255, 255, 255) 0px 0px 0px",
                      appearance: "none",
                      // borderBottom: "3px solid #DF2020",
                    }}
                  />
                </div>
                <div className="max-h-40 space-y-1 overflow-auto rounded-lg border border-slate-300 bg-white p-2 text-sm">
                  {filteredUserOptions.map((option) => {
                    const selected = selectedUserIds.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleUserSelection(option.value)}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left ${
                          selected
                            ? "bg-red-50 text-red-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>
                          {option.label}{" "}
                          <sub className="text-xs text-slate-500">
                            ({option.category})
                          </sub>
                        </span>
                        {selected && (
                          <span className="badge bg-red-600 text-xs text-white">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="btn-primary disabled:opacity-60"
                disabled={creatingTeam || user?.category === "guest"}
                onClick={handleTeamSave}
              >
                {creatingTeam ? "Saving…" : "Save team"}
              </button>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-black">
                  Teams {teams.length}
                </h3>
                {/* <span className="text-xs text-slate-500"> teams</span> */}
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Team
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Members
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {teams.map((team) => (
                      <tr key={team._id} className="hover:bg-white">
                        <td className="px-3 py-2 text-sm">{team.name}</td>
                        <td className="px-3 py-2 text-sm text-slate-300">
                          {team.users.length === 0 ? (
                            <span className="text-slate-500">No members</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {team.users.map((u) => (
                                <span
                                  key={u._id}
                                  className="badge bg-slate-800 text-slate-200"
                                >
                                  {u.fullName}
                                  {team.captainUserId &&
                                  team.captainUserId._id === u._id
                                    ? " (c)"
                                    : ""}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              disabled={user?.category === "guest"}
                              className="rounded-md border border-blue-300 bg-white p-1.5 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => openEditModal(team)}
                              title="Edit team"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              disabled={user?.category === "guest"}
                              className="rounded-md border border-red-300 bg-white p-1.5 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => {
                                setDeleteModalOpen(true);
                                setDeleteModalTeamId(team._id);
                              }}
                              title="Delete team"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                            <button
                              disabled={user?.category === "guest"}
                              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => openCaptainModal(team._id)}
                              title="Make captain"
                            >
                              Make captain
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "weekly" && (
          <div className="mt-4">
            <WeeklyReports />
          </div>
        )}

        {activeTab === "points" && (
          <div className="mt-4 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-black sm:text-base">
                Points Calculations
              </h2>
              <p className="text-xs text-slate-400 sm:text-sm">
                Points are calculated based on these parameters
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Parameter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">Present</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">+2</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">Substitute</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">+2</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">Absent</td>
                    <td className="px-4 py-3 text-sm font-medium text-red-700">-2</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">Medical</td>
                    <td className="px-4 py-3 text-sm font-medium text-red-700">-2</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">Referrals Given Inside (RGI)</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">+5</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">Referrals Given Outside (RGO)</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">+5</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">Visitors</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">+10</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">1-2-1 (One to One)</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">+5</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">Testimonials</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">+5</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">TYFCB (Thank You For Closed Business)</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">1 point per 10,000 with cap of 100 points on each report.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">Conversion</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">+25</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">Training</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">+15</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
      {captainModalTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg bg-white p-4 text-gray-900 shadow-xl">
            <div className="mb-2 text-sm font-medium">Select team captain</div>
            <div className="max-h-48 overflow-auto rounded-md border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {(
                  teams.find((t) => t._id === captainModalTeamId)?.users ?? []
                ).map((u) => (
                  <li
                    key={u._id}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <span>{u.fullName}</span>
                    <input
                      type="radio"
                      name="captain"
                      checked={selectedCaptainUserId === u._id}
                      onChange={() => setSelectedCaptainUserId(u._id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                onClick={() => {
                  setCaptainModalTeamId(null);
                  setSelectedCaptainUserId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-60"
                disabled={!selectedCaptainUserId || savingCaptainLoading}
                onClick={saveCaptain}
              >
                {savingCaptainLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {editModalTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 text-gray-900 shadow-xl">
            <div className="mb-4 text-lg font-semibold">Edit Team</div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="e.g. Alpha Squad"
                  value={editingTeamName}
                  onChange={(e) => setEditingTeamName(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Members
                  </label>
                  <span className="text-xs text-slate-500">
                    Selected: {editingTeamUserIds.length}
                  </span>
                </div>
                <div className="max-h-60 space-y-1 overflow-auto rounded-lg border border-slate-300 bg-white p-2 text-sm">
                  {userOptions
                    .filter((o) =>
                      o.label.toLowerCase().includes(memberSearch.trim().toLowerCase())
                    )
                    .map((option) => {
                      const selected = editingTeamUserIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleEditTeamUserSelection(option.value)}
                          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left ${
                            selected
                              ? "bg-red-50 text-red-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>
                            {option.label}{" "}
                            <sub className="text-xs text-slate-500">
                              ({option.category})
                            </sub>
                          </span>
                          {selected && (
                            <span className="badge bg-red-600 text-xs text-white">
                              Selected
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm"
                onClick={() => {
                  setEditModalTeamId(null);
                  setEditingTeamName("");
                  setEditingTeamUserIds([]);
                  setOriginalTeamName("");
                  setOriginalTeamUserIds([]);
                }}
                disabled={updatingTeam}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                disabled={!editingTeamName || updatingTeam || !hasTeamChanges()}
                onClick={handleUpdateTeam}
              >
                {updatingTeam ? "Updating..." : "Update Team"}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            {/* <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Delete Team
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div> */}

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this team?
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteModalTeamId(null);
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                disabled={!deleteModalTeamId || deleteTeamLoading}
                onClick={() => handleDeleteTeam(deleteModalTeamId as string)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                {deleteTeamLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadingUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="rounded-lg bg-white px-6 py-4 text-center shadow-xl">
            <div className="mb-2 text-sm font-medium text-gray-900">
              Uploading Memebers
            </div>
            <div className="text-xs text-gray-500">
              Please wait while we process your Excel.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
