"use client";

import { useEffect, useState } from "react";
import { fetchUsers, uploadUsersCsv, createTeam, fetchTeams, fetchUserTotals, deleteTeam, updateTeam, downloadUsersSampleXls} from "../../../lib/api";
import WeeklyReports from "../../../components/WeeklyReports";

type TabKey = "upload" | "teams" | "weekly";

interface UserOption { value: string; label: string; }
interface UserRow { _id: string; firstName: string; lastName: string; email?: string; category?: string; teamId?: { name?: string } | null }
interface TeamRow { _id: string; name: string; users: { _id: string; firstName: string; lastName: string; fullName: string; category?: string }[]; captainUserId?: { _id: string; fullName: string } | null }

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
  const [totalsByUserId, setTotalsByUserId] = useState<Record<string, number>>({});
  const [captainModalTeamId, setCaptainModalTeamId] = useState<string | null>(null);
  const [selectedCaptainUserId, setSelectedCaptainUserId] = useState<string | null>(null);
  const pageSize = 25;

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
        setUserOptions(
          usersData.map((u) => ({ value: u._id, label: `${u.firstName} ${u.lastName}` }))
        );
        const totalsMap: Record<string, number> = {};
        totals.forEach(t => { totalsMap[t.userId] = t.totalPoints; });
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

  const handleUserCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setUserOptions(usersData.map((u) => ({ value: u._id, label: `${u.firstName} ${u.lastName}` })));
      const totalsMap: Record<string, number> = {};
      totals.forEach(t => { totalsMap[t.userId] = t.totalPoints; });
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
      await deleteTeam(id);
      const teamsData = await fetchTeams();
      const usersData = await fetchUsers();
      const totals = await fetchUserTotals();
      const totalsMap: Record<string, number> = {};
      totals.forEach(t => { totalsMap[t.userId] = t.totalPoints; });
      setUsers(usersData as any);
      setTeams(teamsData as any);
    } catch (err: any) {
      setError(err.message || "Failed to delete team");
    }
  };

  const openCaptainModal = (teamId: string) => {
    setCaptainModalTeamId(teamId);
    setSelectedCaptainUserId(null);
  };

  const saveCaptain = async () => {
    if (!captainModalTeamId) return;
    try {
      await updateTeam(captainModalTeamId, { captainUserId: selectedCaptainUserId ?? null });
      const teamsData = await fetchTeams();
      const usersData = await fetchUsers();
      const totals = await fetchUserTotals();
      const totalsMap: Record<string, number> = {};
      totals.forEach(t => { totalsMap[t.userId] = t.totalPoints; });
      setUsers(usersData as any);
      setTeams(teamsData as any);
    } catch (err: any) {
      setError(err.message || "Failed to set captain");
    } finally {
      setCaptainModalTeamId(null);
      setSelectedCaptainUserId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = (u.email ?? '').toLowerCase();
    const category = (u.category ?? '').toLowerCase();
    const teamName = (typeof u.teamId === 'object' && u.teamId?.name ? u.teamId.name.toLowerCase() : '');
    return fullName.includes(q) || email.includes(q) || category.includes(q) || teamName.includes(q);
  });

  const filteredUserOptions = userOptions.filter((o) => o.label.toLowerCase().includes(memberSearch.trim().toLowerCase()));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
         Manage members, power teams, and weekly report for your dashboard.
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
              User upload
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
          </nav>
        </div>

        {activeTab === "upload" && (
          <div className="mt-4 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {/* Previous title preserved; commenting to avoid removal */}
                {/* <h2 className="text-sm font-semibold text-black sm:text-base">Upload users CSV</h2> */}
                <h2 className="text-sm font-semibold text-black sm:text-base">Upload members Excel (.xls/.xlsx)</h2>
                {/* <p className="text-xs text-slate-400 sm:text-sm">Import users with their basic details via CSV.</p> */}
                <p className="text-xs text-slate-400 sm:text-sm">Import members with their basic details via Excel (.xls/.xlsx).</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await downloadUsersSampleXls();
                    } catch (e) {
                      console.error(e);
                      alert('Failed to download sample .xls file');
                    }
                  }}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                >
                  Download sample Excel (.xls)
                </button>
                <label className=" cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-50">
                  <span>{uploadingUsers ? "Uploading…" : "Select Excel/CSV file (.xls/.xlsx/.csv)"}</span>
                  <input
                    type="file"
                    accept=".xls,.xlsx,.csv"
                    className="hidden"
                    disabled={uploadingUsers}
                    onChange={handleUserCsvUpload}
                  />
                </label>
              </div>
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
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">First name</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Last name</th>
                      {/* <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Email</th> */}
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Category</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Team</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Total score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredUsers.slice((currentPage-1)*pageSize, currentPage*pageSize).map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-sm">{user.firstName}</td>
                        <td className="px-3 py-2 text-sm">{user.lastName}</td>
                        {/* <td className="px-3 py-2 text-sm text-slate-700">{user.email ?? '-'}</td> */}
                        <td className="px-3 py-2 text-sm text-slate-700">
                          <span className="badge bg-slate-200 text-slate-800">{user.category ?? '-'}</span>
                        </td>
                        <td className="px-3 py-2 text-sm">{user.teamId && typeof user.teamId === 'object' ? user.teamId.name ?? '-' : '-'}</td>
                        <td className="px-3 py-2 text-sm">{totalsByUserId[user._id] ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between py-2 text-xs text-slate-600">
                <div>
                  Showing {(currentPage-1)*pageSize + 1}–{Math.min(currentPage*pageSize, filteredUsers.length)} of {filteredUsers.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 disabled:opacity-60"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p-1))}
                  >
                    Prev
                  </button>
                  <button
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 disabled:opacity-60"
                    disabled={currentPage*pageSize >= filteredUsers.length}
                    onClick={() => setCurrentPage((p) => p+1)}
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
                Create team
              </h2>
              <p className="text-xs text-slate-400 sm:text-sm">
               Group members into power teams to compare performance across the BNI.
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
                  <span className="text-xs text-slate-500">Selected members: {selectedUserIds.length}</span>
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
                        <span>{option.label}</span>
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
                disabled={creatingTeam}
                onClick={handleTeamSave}
              >
                {creatingTeam ? 'Saving…' : 'Save team'}
              </button>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-black">Teams {teams.length}</h3>
                {/* <span className="text-xs text-slate-500"> teams</span> */}
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Team</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Members</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
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
                                <span key={u._id} className="badge bg-slate-800 text-slate-200">{u.fullName}{team.captainUserId && team.captainUserId._id === u._id ? ' (c)' : ''}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <button
                            className="rounded-md border border-red-300 bg-white px-2 py-1 text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteTeam(team._id)}
                          >
                            Delete
                          </button>
                          <button
                            className="mt-2 rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-700 hover:bg-gray-50"
                            onClick={() => openCaptainModal(team._id)}
                          >
                            Make captain
                          </button>
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
      </section>
      {captainModalTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg bg-white p-4 text-gray-900 shadow-xl">
            <div className="mb-2 text-sm font-medium">Select team captain</div>
            <div className="max-h-48 overflow-auto rounded-md border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {(teams.find(t => t._id === captainModalTeamId)?.users ?? []).map((u) => (
                  <li key={u._id} className="flex items-center justify-between px-3 py-2">
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
              <button className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm" onClick={() => { setCaptainModalTeamId(null); setSelectedCaptainUserId(null); }}>Cancel</button>
              <button className="rounded-md bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-60" disabled={!selectedCaptainUserId} onClick={saveCaptain}>Save</button>
            </div>
          </div>
        </div>
      )}
            {uploadingUsers && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="rounded-lg bg-white px-6 py-4 text-center shadow-xl">
                  <div className="mb-2 text-sm font-medium text-gray-900">Uploading users…</div>
                  <div className="text-xs text-gray-500">Please wait while we process your Excel/CSV.</div>
                </div>
              </div>
            )}
    </div>
  );
}


