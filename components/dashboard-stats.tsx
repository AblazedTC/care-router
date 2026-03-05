"use client"

import {
  Activity,
  Building2,
  BedDouble,
  Clock,
} from "lucide-react"
import { hospitals } from "@/lib/mock-data"

const stats = [
  {
    label: "Hospitals Online",
    value: hospitals.length.toString(),
    icon: Building2,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Total Beds Free",
    value: hospitals.reduce((acc, h) => acc + h.availableBeds, 0).toString(),
    icon: BedDouble,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    label: "Avg Wait Time",
    value: "~20 min",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    label: "System Status",
    value: "Online",
    icon: Activity,
    color: "text-success",
    bg: "bg-success/10",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
        >
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg ${stat.bg}`}
          >
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-foreground leading-none">
              {stat.value}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
