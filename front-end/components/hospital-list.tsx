"use client"

import { Building2 } from "lucide-react"
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
        <Building2 className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No matching hospitals found
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between shrink-0">
        <p className="text-sm text-muted-foreground">
          {hospitals.length} hospitals matched
        </p>
        <div className="flex items-center gap-1">
          {(
            [
              { key: "score", label: "Best match" },
              { key: "distance", label: "Nearest" },
              { key: "beds", label: "Most beds" },
            ] as { key: SortKey; label: string }[]
          ).map(({ key, label }) => (
            <Button
              key={key}
              variant={sortBy === key ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
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
