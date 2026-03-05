"use client"

import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react"
import type { TriageCondition } from "@/lib/mock-data"
import { getSeverityBg, getSeverityColor } from "@/lib/triage-engine"

interface TriageResultProps {
  condition: TriageCondition
  userInput: string
}

function SeverityIcon({ severity }: { severity: string }) {
  const className = `w-4 h-4 ${getSeverityColor(severity)}`
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
    <div className="space-y-3 h-full">
      <div
        className={`rounded-lg border p-4 space-y-3 ${getSeverityBg(condition.severity)}`}
      >
        <div className="flex items-start gap-2.5">
          <SeverityIcon severity={condition.severity} />
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className="font-semibold text-foreground text-sm"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {condition.name}
              </h4>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${getSeverityColor(condition.severity)} ${getSeverityBg(condition.severity)}`}
              >
                {condition.severity}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {condition.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Confidence
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-background/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000"
                  style={{ width: `${condition.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground">
                {Math.round(condition.confidence * 100)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Specialties
            </p>
            <p className="text-xs font-medium text-foreground">
              {condition.specialty.join(", ")}
            </p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground italic truncate">
        Based on: &ldquo;{userInput}&rdquo;
      </p>
    </div>
  )
}
