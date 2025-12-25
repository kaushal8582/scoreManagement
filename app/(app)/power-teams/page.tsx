"use client";

import { useEffect, useState } from "react";
import { fetchTeamBreakdown, fetchUserBreakdown } from "../../../lib/api";
// import { CircleChart } from "../../../components/CircleChart";
import { BuildingChart } from "../../../components/BuildingChart";
import { CircleChart } from "../../../components/CircleChart";

export default function PowerTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [userBreakdownByTeam, setUserBreakdownByTeam] = useState<
    Record<string, any[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("userBreak in powerTeam");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const t = await fetchTeamBreakdown();
        console.log("t", t);
        if (!mounted) return;
        setTeams(t as any);
        // Load per-team member breakdowns (request all members for each team)
        const entries = await Promise.all(
          t.map((team: any) =>
            fetchUserBreakdown(team?.teamMembersCount || 50, team.teamId).then(
              (rows) => [team.teamId, rows]
            )
          )
        );
        const map: Record<string, any[]> = {};
        entries.forEach(([id, rows]: any) => {
          map[id] = rows;
        });
        if (!mounted) return;
        setUserBreakdownByTeam(map);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Failed to load power teams");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 ">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl text-[#DC2627]">
          Power Teams
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Top-level view of team points and member breakdowns.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      ) : null}
       {loading ? (
        <div>
          <div className="flex items-center min-h-[80vh] justify-center gap-2">
            <div className="animate-spin rounded-full border-4 border-solid border-gray-300 border-t-transparent h-8 w-8"></div>
            <div className="text-sm font-medium text-gray-700">Loading...</div>
          </div>
        </div>
      ) : null}

{loading ? null : (
      <div className="grid gap-4 sm:grid-cols-1">
        {teams.map((t: any) => (
          <div
            key={t.teamId}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {t.teamName}
                </div>
                {t.captainFullName ? (
                  <div className="text-xs text-gray-500">
                    Captain: {t.captainFullName}
                  </div>
                ) : null}
              </div>
              <div className="text-sm font-semibold text-green-700">
                Total Points : {t.totalPoints.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Overall Stats
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-8 gap-3">
                  {(() => {
                    // ===== POINT CALCULATIONS =====
                    const attendancePoints =
                      (t.P  + t.S) * 2 + t.A * -2 + t.M * -2;

                    const referralsGivenPoints = (t.RGI + t.RGO)*5;
                    const referralsReceivedPoints = (t.RRI + t.RRO) * 5;

                    const visitorsPoints = t.V * 10;
                    const oneToOnePoints = t.oneToOne * 5;

                    const tyfcbPoints =
                      Number(((t.TYFCB_amount || 0) / 10000).toFixed(2));
                    // const conversionPoints = t.CON * 25;

                    const trainingPoints = t.TR * 15;
                    const testimonialsPoints = t.T * 5;

                    // ===== FINAL 8 BOXES =====
                    const items = [
                      {
                        k: "attendance",
                        label: "Attendance",
                        v: attendancePoints,
                        tooltip:
                          "Present *2 + Medical *(-2) + Substitute*2 + Absent*(-2) ",
                      },
                      {
                        k: "visitors",
                        label: "Visitors",
                        v: visitorsPoints,
                        tooltip: "Visitors * 10",
                      },
                      {
                        k: "refGiven",
                        label: "Referrals",
                        v: referralsGivenPoints,
                        tooltip: "RGI + RGO × 5",
                      },
                      // {
                      //   k: "refReceived",
                      //   label: "Referrals Received",
                      //   v: referralsReceivedPoints,
                      //   tooltip: "RRI + RRO × 5",
                      // },
                      {
                        k: "oneToOne",
                        label: "1-2-1",
                        v: oneToOnePoints,
                        tooltip: "One to One Meetings × 5",
                      },
                      {
                        k: "Conversion",
                        label: "Conversion",
                        v: t.CON * 25,
                        tooltip: "Conversion × 25",
                      },
                      {
                        k: "tyfcb",
                        label: "TYFCB",
                        v: tyfcbPoints,
                        tooltip: "Thank You For Closed Business × 1",
                      },
                      {
                        k: "training",
                        label: "Training",
                        v: trainingPoints,
                        tooltip: "Training × 15",
                      },
                      {
                        k: "testimonials",
                        label: "Testimonials",
                        v: testimonialsPoints,
                        tooltip: "Testimonials × 5",
                      },
                    ];

                    return items.map((item) => (
                      <div
                        key={item.k}
                        className="rounded-md border border-gray-200 bg-white p-3"
                      >
                        <div className="relative group text-xs text-gray-500">
                          {item.label}
                          <div className="absolute hidden group-hover:block -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded bg-black px-2 py-1 text-xs text-white whitespace-nowrap">
                            {item.tooltip}
                          </div>
                        </div>

                        <div className="mt-1 text-sm font-semibold text-green-700">
                          {item.v.toLocaleString()}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* <div>
                <div className="text-xs font-medium text-gray-600 mb-2 mt-6">
                 Team Stats by category
                </div>
                <CircleChart
                  className="!flex-row !gap-[60px]"
                  data={(() => {
                    // ===== POINT CALCULATIONS (same everywhere) =====
                    const attendancePointsRaw =
                      (t.P + t.L + t.M + t.S) * 2 + t.A * -2;

                    const referralsGivenPoints = (t.RGI + t.RGO) * 5;
                    const referralsReceivedPoints = (t.RRI + t.RRO) * 5;

                    const visitorsPoints = t.V * 10;
                    const oneToOnePoints = t.oneToOne * 5;

                    const tyfcbPoints =
                      Math.floor((t.TYFCB_amount || 0) / 10000) * 1;

                    const trainingPoints = t.CEU * 15;
                    const testimonialsPoints = t.T * 5;

                    return [
                      { label: "Attendance", value: attendancePointsRaw },
                      { label: "Visitors", value: visitorsPoints },
                      { label: "Referrals ", value: referralsGivenPoints },
                      {
                        label: "Conversion",
                        value: t.CON,
                      },
                      { label: "1-2-1", value: oneToOnePoints },
                      { label: "TYFCB", value: tyfcbPoints },
                      { label: "Training", value: trainingPoints },
                      { label: "Testimonials", value: testimonialsPoints },
                    ];
                  })()}
                />
              </div> */}

              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Members breakdown
                </div>
                <BuildingChart
                  data={(userBreakdownByTeam[t.teamId] || []).map((u: any) => {
                    // ===== ATTENDANCE (Medical = -2) =====
                    const attendancePoints =
                      (u.P  + u.S) * 2 + // Present-like
                      u.M * -2 + // Medical = -2
                      u.A * -2; // Absent = -2

                    // ===== OTHER POINTS =====
                    const referralsPoints = (u.RGI + u.RGO ) * 5;
                    const visitorPoints = u.V * 10;
                    const oneToOnePoints = u.oneToOne * 5;
                    const trainingPoints = u.TR * 15;
                    const testimonialPoints = u.T * 5;
                    const tyfcbPoints =
                      Number(((u.TYFCB_amount || 0) / 10000).toFixed(2));
                    // const conversionPoints = u.CON * 25;

                    // ===== TOTAL POINTS =====
                    const totalPoints =
                      attendancePoints +
                      referralsPoints +
                      visitorPoints +
                      oneToOnePoints +
                      trainingPoints +
                      testimonialPoints +
                      tyfcbPoints;

                    return {
                      name:
                        u.fullName.split(" ")[0] +
                        " " +
                        (u.fullName.split(" ")[1]?.charAt(0) || "") +
                        ".",

                      // ✅ ONLY 8 FIELDS
                      Attendance: attendancePoints,
                      Visitors: visitorPoints,
                      Referrals: referralsPoints,
                      "121": oneToOnePoints,
                      TYFCB: tyfcbPoints,
                      Training: trainingPoints,
                      Testimonials: testimonialPoints,
                      Conversion: u.CON * 25,
                      totalPoints: totalPoints,
                    };
                  })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
)}

      {!loading && teams.length === 0 ? (
        <div className="text-sm text-gray-500">No teams yet.</div>
      ) : null}
    </div>
  );
}
