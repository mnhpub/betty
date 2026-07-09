"use client";

import { LineChart } from "@carbon/charts-react";
import type { LineChartOptions } from "@carbon/charts/interfaces";
import { ScaleTypes } from "@carbon/charts/interfaces";
import "@carbon/charts-react/styles.css";

// Mock data — active members per group type, by month. Replace with a real
// query against TPOF-3 (Membership) once that data model exists.
const data = [
  { group: "Discipleship groups", date: "2026-02-01", value: 42 },
  { group: "Discipleship groups", date: "2026-03-01", value: 51 },
  { group: "Discipleship groups", date: "2026-04-01", value: 58 },
  { group: "Discipleship groups", date: "2026-05-01", value: 67 },
  { group: "Discipleship groups", date: "2026-06-01", value: 74 },
  { group: "Discipleship groups", date: "2026-07-01", value: 83 },
  { group: "Recovery groups", date: "2026-02-01", value: 20 },
  { group: "Recovery groups", date: "2026-03-01", value: 25 },
  { group: "Recovery groups", date: "2026-04-01", value: 29 },
  { group: "Recovery groups", date: "2026-05-01", value: 31 },
  { group: "Recovery groups", date: "2026-06-01", value: 38 },
  { group: "Recovery groups", date: "2026-07-01", value: 44 },
];

const options: LineChartOptions = {
  title: "Active members by group type",
  axes: {
    bottom: {
      title: "Month",
      mapsTo: "date",
      scaleType: ScaleTypes.TIME,
    },
    left: {
      title: "Active members",
      mapsTo: "value",
      scaleType: ScaleTypes.LINEAR,
    },
  },
  curve: "curveMonotoneX",
  height: "320px",
};

export default function MembershipChart() {
  return <LineChart data={data} options={options} />;
}
