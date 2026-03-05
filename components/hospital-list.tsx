"use client"

import { Building2, SlidersHorizontal } from "lucide-react"
import { useState } from "react"
import { HospitalCard } from "@/components/hospital-card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ScoredHospital } from "@/lib/triage-engine"

interface HospitalListProps {
  hospitals: ScoredHospital[]
  onGenerateReferral: (hospital: ScoredHospital) => void
  selectedHospitalId: string | null
}

type SortKey = "score" | "distance" | "beds"

export function HospitalList({
  hospitals,
  onGenerateReferral,
  selectedHospitalId,
}: HospitalListProps) {
  const [sortBy, setSortBy] = useState<SortKey>("score")

  const sorted = [...hospitals].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        return a.distance - b.distance
      case "beds":
        return b.availableBeds - a.availableBeds
      case "score":
      default:
        return b.matchScore - a.matchScore
    }
  })

  if (hospitals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Building2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">No hospitals yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Enter symptoms to find matching hospitals
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3
            className="text-sm font-semibold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Hospitals
          </h3>
          <span className="text-xs text-muted-foreground">
            ({hospitals.length})
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <SlidersHorizontal className="w-3 h-3 text-muted-foreground mr-1" />
          {(
            [
              { key: "score", label: "Match" },
              { key: "distance", label: "Near" },
              { key: "beds", label: "Beds" },
            ] as { key: SortKey; label: string }[]
          ).map(({ key, label }) => (
            <Button
              key={key}
              variant={sortBy === key ? "default" : "ghost"}
              size="sm"
              className="text-[11px] h-6 px-2"
              onClick={() => setSortBy(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pr-3">
          {sorted.map((hospital, index) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              rank={sortBy === "score" ? index + 1 : 0}
              onGenerateReferral={onGenerateReferral}
              isSelected={selectedHospitalId === hospital.id}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
