type SummaryValues = Record<string, number>;

type SummaryBoxesProps = {
  values: SummaryValues;
};

const sum = (values: SummaryValues, keys: string[]) =>
  keys.reduce((total, key) => total + (values[key] || 0), 0);

export default function SummaryBoxes({ values }: SummaryBoxesProps) {
  const boxes = [
    {
      key: "attendance",
      label: "Attendance",
      tooltip: "Present + Absent + Late + Medical + Substitute",
      value: sum(values, ["P", "A", "L", "M", "S"]),
    },
    {
      key: "visitors",
      label: "Visitors",
      tooltip: "Total Visitors",
      value: sum(values, ["V"]),
    },
    {
      key: "refGiven",
      label: "Referrals ",
      tooltip: "RGI + RGO",
      value: sum(values, ["RGI", "RGO"]),
    },
    // {
    //   key: "refReceived",
    //   label: "Referrals Received",
    //   tooltip: "RRI + RRO",
    //   value: sum(values, ["RRI", "RRO"]),
    // },
    {
      key: "Conversion",
      label: "Conversion",
      tooltip: "Conversion",
      value: sum(values, ["CON"]),
    },
    {
      key: "tyfcb",
      label: "TYFCB",
      tooltip: "Thank You For Closed Business",
      value: sum(values, ["TYFCB_amount"]),
    },
    {
      key: "testimonials",
      label: "Testimonials",
      tooltip: "Testimonials",
      value: sum(values, ["T"]),
    },
    {
      key: "training",
      label: "Training",
      tooltip: "Training",
      value: sum(values, ["CEU"]),
    },
    {
      key: "oneToOne",
      label: "1-2-1",
      tooltip: "One to One Meetings Held",
      value: sum(values, ["oneToOne"]),
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
