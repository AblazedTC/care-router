import {
  type Hospital,
  type TriageCondition,
  hospitals,
  symptomRules,
  directDiagnoses,
} from "./mock-data"

export function triageFromSymptoms(input: string): TriageCondition | null {
  const lower = input.toLowerCase().trim()

  // Check for direct diagnosis first
  for (const [key, condition] of Object.entries(directDiagnoses)) {
    if (lower.includes(key)) {
      return condition
    }
  }

  // Score each rule based on keyword matches
  let bestMatch: TriageCondition | null = null
  let bestScore = 0

  for (const rule of symptomRules) {
    const matchCount = rule.keywords.filter((kw) => lower.includes(kw)).length
    if (matchCount > bestScore) {
      bestScore = matchCount
      bestMatch = rule.condition
    }
  }

  return bestMatch
}

export interface ScoredHospital extends Hospital {
  matchScore: number
  matchReasons: string[]
}

export function matchHospitals(condition: TriageCondition): ScoredHospital[] {
  const scored: ScoredHospital[] = hospitals.map((hospital) => {
    let score = 0
    const reasons: string[] = []

    // Specialty match (highest weight)
    const specialtyOverlap = hospital.specialty.filter((s) =>
      condition.specialty.includes(s)
    )
    if (specialtyOverlap.length > 0) {
      score += specialtyOverlap.length * 30
      reasons.push(`Specializes in ${specialtyOverlap.join(", ")}`)
    }

    // Emergency capability for critical/high severity
    if (
      (condition.severity === "critical" || condition.severity === "high") &&
      hospital.emergency
    ) {
      score += 20
      reasons.push("Emergency department available")
    }

    // Distance (closer is better)
    if (hospital.distance <= 3) {
      score += 15
      reasons.push("Very close to your location")
    } else if (hospital.distance <= 5) {
      score += 10
      reasons.push("Nearby location")
    } else {
      score += 5
    }

    // Bed availability
    if (hospital.availableBeds > 10) {
      score += 10
      reasons.push("High bed availability")
    } else if (hospital.availableBeds > 5) {
      score += 5
      reasons.push("Moderate bed availability")
    }

    // Rating
    if (hospital.rating >= 4.7) {
      score += 8
    } else if (hospital.rating >= 4.5) {
      score += 5
    }

    return {
      ...hospital,
      matchScore: score,
      matchReasons: reasons,
    }
  })

  // Sort by score descending, only return hospitals with some specialty match
  return scored
    .filter((h) => h.matchScore > 20)
    .sort((a, b) => b.matchScore - a.matchScore)
}

export function generateReferralToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const segments = []
  for (let s = 0; s < 3; s++) {
    let segment = ""
    for (let i = 0; i < 4; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)]
    }
    segments.push(segment)
  }
  return `MR-${segments.join("-")}`
}

export function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "text-destructive"
    case "high":
      return "text-warning"
    case "moderate":
      return "text-primary"
    case "low":
      return "text-success"
    default:
      return "text-muted-foreground"
  }
}

export function getSeverityBg(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-destructive/10 border-destructive/30"
    case "high":
      return "bg-warning/10 border-warning/30"
    case "moderate":
      return "bg-primary/10 border-primary/30"
    case "low":
      return "bg-success/10 border-success/30"
    default:
      return "bg-muted border-border"
  }
}
