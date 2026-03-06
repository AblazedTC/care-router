"use client"

import {
  MapPin,
  Star,
  BedDouble,
  Clock,
  Zap,
  FileText,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScoredHospital } from "@/lib/triage-engine"
import { getGoogleMapsUrl } from "@/lib/utils"

interface HospitalCardProps {
  hospital: ScoredHospital
  rank: number
  onGenerateReferral: (hospital: ScoredHospital) => void
  isSelected: boolean
}

export function HospitalCard({
  hospital,
  rank,
  onGenerateReferral,
  isSelected,
}: HospitalCardProps) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 transition-all ${
        isSelected
          ? "border-primary ring-1 ring-primary/20"
          : "border-border hover:border-primary/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {rank > 0 && rank <= 3 && (
              <span
                className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  rank === 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                #{rank}
              </span>
            )}
            <h3
              className="font-semibold text-sm text-foreground truncate"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {hospital.name}
            </h3>
            {hospital.emergency && (
              <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                <Zap className="w-2.5 h-2.5 inline mr-0.5" />
                ER
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{hospital.address}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-xs font-medium text-foreground shrink-0">
          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
          {hospital.rating}
        </div>
      </div>

      <div className="flex items-center gap-4 py-2.5 border-y border-border/50 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <BedDouble className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium text-foreground">
            {hospital.availableBeds}
          </span>{" "}
          beds
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-primary" />
          {hospital.waitTime}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {hospital.distance} km
        </span>
      </div>

      {hospital.matchReasons.length > 0 && (
        <ul className="mb-3 space-y-1">
          {hospital.matchReasons.slice(0, 2).map((reason) => (
            <li
              key={reason}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-2 mb-3">
        <a
          href={getGoogleMapsUrl(hospital.name, hospital.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View on Google Maps
        </a>
      </div>

      <Button
        onClick={() => onGenerateReferral(hospital)}
        className="w-full gap-1.5 h-9 text-xs rounded-lg"
        variant={isSelected ? "secondary" : "default"}
        size="sm"
        disabled={isSelected}
      >
        <FileText className="w-3.5 h-3.5" />
        {isSelected ? "Referral Generated" : "Generate Referral"}
      </Button>
    </div>
  )
}
