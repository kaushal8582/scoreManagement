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
            fetchUserBreakdown(team?.teamMembersCount || 50, team.teamId).then((rows) => [
              team.teamId,
              rows,
            ])
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
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
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
                {t.totalPoints.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Team points by category
                </div>
                <CircleChart
                  data={(() => {
                    const presentPoints = (t.P + t.L + t.M + t.S) * 2;
                    const absentPoints = Math.abs(t.A * -2);
                    const tyfcbPoints =
                      Math.floor((t.TYFCB_amount || 0) / 1000) * 1;
                    return [
                      { label: "Present", value: presentPoints },
                      { label: "Absent", value: absentPoints },
                      { label: "RGI", value: t.RGI * 5 },
                      { label: "RGO", value: t.RGO * 5 },
                      { label: "RRI", value: t.RRI * 5 },
                      { label: "RRO", value: t.RRO * 5 },
                      { label: "Visitor", value: t.V * 10 },
                      { label: "121", value: t.oneToOne * 5 },
                      { label: "Testimonial", value: t.CEU * 5 },
                      { label: "Training", value: t.T * 5 },
                      { label: "TYFCB", value: tyfcbPoints },
                    ];
                  })()}
                />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">Total Points by Category</div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {(() => {
                    const presentPoints = (t.P + t.L + t.M + t.S) * 2;
                    const absentPoints = t.A * -2;
                    const tyfcbPoints = Math.floor((t.TYFCB_amount || 0) / 1000) * 1;
                    const items = [
                      { k: "P", label: "P", v: presentPoints },
                      { k: "A", label: "A", v: absentPoints },
                      { k: "L", label: "L", v: 0 },
                      { k: "M", label: "M", v: 0 },
                      { k: "S", label: "S", v: 0 },
                      { k: "RGI", label: "RGI", v: t.RGI * 5 },
                      { k: "RGO", label: "RGO", v: t.RGO * 5 },
                      { k: "RRI", label: "RRI", v: t.RRI * 5 },
                      { k: "RRO", label: "RRO", v: t.RRO * 5 },
                      { k: "V", label: "V", v: t.V * 10 },
                      { k: "oneToOne", label: "121", v: t.oneToOne * 5 },
                      { k: "TYFCB_amount", label: "TYFCB Amount", v: tyfcbPoints },
                      { k: "CEU", label: "CEU", v: t.CEU * 5 },
                      { k: "T", label: "T", v: t.T * 5 },
                    ];
                    return items.map((item) => (
                      <div key={item.k} className="rounded-md border border-gray-200 bg-white p-3">
                        <div className="text-xs text-gray-500">{item.label}</div>
                        <div className="mt-1 text-sm font-semibold text-green-700">{item.v.toLocaleString()}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Members breakdown
                </div>
                <BuildingChart
                  data={(userBreakdownByTeam[t.teamId] || []).map((u: any) => {
                    const presentPoints = (u.P + u.L + u.M + u.S) * 2;
                    const absentPoints = u.A * -2;
                    const referralPoints = (u.RGI + u.RGO + u.RRI + u.RRO) * 5;
                    const visitorPoints = u.V * 10;
                    const oneToOnePoints = u.oneToOne * 5;
                    const testimonialPoints = u.CEU * 5;
                    const trainingPoints = u.T * 5;
                    const tyfcbPoints =
                      Math.floor((u.TYFCB_amount || 0) / 1000) * 1;

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
                      name: u.fullName,

                      // stacked values (POINTS)
                      P: presentPoints,
                      A: absentPoints,
                      L: 0,
                      M: 0,
                      S: 0,

                      RGI: u.RGI * 5,
                      RGO: u.RGO * 5,
                      RRI: u.RRI * 5,
                      RRO: u.RRO * 5,

                      V: visitorPoints,
                      oneToOne: oneToOnePoints,
                      CEU: testimonialPoints,
                      T: trainingPoints,

                      // amount converted to points
                      TYFCB_amount: tyfcbPoints,

                      totalPoints: computedTotal,
                    };
                  })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && teams.length === 0 ? (
        <div className="text-sm text-gray-500">No teams yet.</div>
      ) : null}
    </div>
  );
}
