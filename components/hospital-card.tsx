"use client"

import {
  MapPin,
  Clock,
  Star,
  BedDouble,
  Zap,
  FileText,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ScoredHospital } from "@/lib/triage-engine"

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
      className={`group relative rounded-lg border bg-card transition-all duration-200 hover:shadow-md hover:border-primary/30 ${
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
    >
      {rank > 0 && rank <= 3 && (
        <div className="absolute -top-2.5 left-3 z-10">
          <span
            className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              rank === 1
                ? "bg-primary text-primary-foreground"
                : rank === 2
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground"
            }`}
          >
            {rank === 1 ? "Best Match" : `#${rank}`}
          </span>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2 pt-0.5">
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3
                className="font-semibold text-foreground text-sm leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {hospital.name}
              </h3>
              {hospital.emergency && (
                <Badge
                  variant="destructive"
                  className="text-[9px] px-1 py-0 h-4"
                >
                  <Zap className="w-2.5 h-2.5 mr-0.5" />
                  ER
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{hospital.address}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-0.5 text-xs font-medium text-foreground">
              <Star className="w-3.5 h-3.5 text-warning fill-warning" />
              {hospital.rating}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {hospital.distance} km
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {hospital.specialty.slice(0, 3).map((spec) => (
            <Badge
              key={spec}
              variant="secondary"
              className="text-[10px] py-0 px-1.5 h-5"
            >
              {spec}
            </Badge>
          ))}
          {hospital.specialty.length > 3 && (
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5">
              +{hospital.specialty.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 py-2 border-y border-border/50 text-xs">
          <div className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">
              {hospital.availableBeds}
            </span>
            <span className="text-muted-foreground">beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">
              {hospital.waitTime}
            </span>
          </div>
        </div>

        {hospital.matchReasons.length > 0 && (
          <ul className="space-y-0.5">
            {hospital.matchReasons.slice(0, 2).map((reason) => (
              <li
                key={reason}
                className="flex items-center gap-1 text-[11px] text-foreground/80"
              >
                <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        )}

        <Button
          onClick={() => onGenerateReferral(hospital)}
          className="w-full gap-1.5 h-8 text-xs"
          variant={isSelected ? "secondary" : "default"}
          size="sm"
          disabled={isSelected}
        >
          <FileText className="w-3.5 h-3.5" />
          {isSelected ? "Referral Generated" : "Generate Referral"}
        </Button>
      </div>
    </div>
  )
}
