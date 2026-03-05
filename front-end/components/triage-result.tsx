"use client"

import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react"
import type { TriageCondition } from "@/lib/mock-data"
import { getSeverityColor } from "@/lib/triage-engine"

interface TriageResultProps {
  condition: TriageCondition
  userInput: string
}

function SeverityIcon({ severity }: { severity: string }) {
  const className = `w-5 h-5 ${getSeverityColor(severity)}`
  switch (severity) {
    case "critical":
      return <ShieldAlert className={className} />
    case "high":
      return <AlertTriangle className={className} />
    case "moderate":
      return <Info className={className} />
    case "low":
      return <CheckCircle2 className={className} />
    default:
      return <Info className={className} />
  }
}

export function TriageResult({ condition, userInput }: TriageResultProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Assessment
        </p>
        <div className="flex items-start gap-3">
          <SeverityIcon severity={condition.severity} />
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-foreground text-base leading-snug"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {condition.name}
            </h3>
            <span
              className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider ${getSeverityColor(condition.severity)}`}
            >
              {condition.severity} severity
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {condition.description}
      </p>

      {/* Confidence */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-muted-foreground">Confidence</p>
          <p className="text-xs font-medium text-foreground">
            {Math.round(condition.confidence * 100)}%
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-1000"
            style={{ width: `${condition.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Specialties */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Specialties needed</p>
        <div className="flex flex-wrap gap-1.5">
          {condition.specialty.map((spec) => (
            <span
              key={spec}
              className="px-2.5 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Based on */}
      <p className="text-xs text-muted-foreground/70 italic">
        Based on: &ldquo;{userInput}&rdquo;
      </p>
    </div>
  )
}
