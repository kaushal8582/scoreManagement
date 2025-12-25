"use client";

type SummaryValues = Record<string, number>;

type SummaryBoxesProps = {
  values: SummaryValues;
};

/* ================= POINT CALCULATIONS ================= */

// Attendance
// P, L, S = +2
// M (Medical) = -2
// A (Absent) = -2
const attendancePoints = (v: SummaryValues) =>
  (v.P + v.S) * 2 +
  (v.M || 0) * -2 +
  (v.A || 0) * -2;

// Referrals (Given + Received)
const referralPoints = (v: SummaryValues) =>
  (v.RGI + v.RGO ) ;

// TYFCB → ₹10000 = 1 point
const tyfcbPoints = (v: SummaryValues) =>
  Number(((v.TYFCB_amount || 0) / 10000).toFixed(2));


/* ================= COMPONENT ================= */



export default function SummaryBoxes({ values }: SummaryBoxesProps) {

  // console.log("values", values);


  const boxes = [
    {
      key: "attendance",
      label: "Attendance",
      tooltip: "Present *2, Medical *-2, Absent *-2, Substitute *2",
      value: attendancePoints(values),
    },
    {
      key: "visitors",
      label: "Visitors",
      tooltip: "Visitors *10",
      value: (values.V || 0) * 10,
    },
    {
      key: "referrals",
      label: "Referrals",
      tooltip: "RGI + RGO *5",
      value: referralPoints(values),
    },
    {
      key: "conversion",
      label: "Conversion",
      tooltip: "Total Conversions *25",
      value: values.CON * 25 || 0,
    },
    {
      key: "tyfcb",
      label: "TYFCB",
      tooltip: "Thank You For Closed Business *1",
      value: tyfcbPoints(values),
    },
    {
      key: "testimonials",
      label: "Testimonials",
      tooltip: "Testimonials *5",
      value: (values.T || 0) * 5,
    },
    {
      key: "training",
      label: "Training",
      tooltip: "Training *15",
      value: (values.TR || 0) * 15,
    },
    {
      key: "oneToOne",
      label: "1-2-1",
      tooltip: "One to One Meetings Held *5",
      value: (values.oneToOne || 0) * 5,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-8 gap-3">
      {boxes.map((item) => (
        <div
          key={item.key}
          className="rounded-md border border-gray-200 bg-white p-3"
        >
          <div className="relative group text-xs text-gray-500">
            {item.label}
            <div className="absolute hidden group-hover:block -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded bg-black px-2 py-1 text-xs text-white whitespace-nowrap">
              {item.tooltip}
            </div>
          </div>

          <div className="mt-1 text-sm font-semibold text-green-700">
            {item.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
