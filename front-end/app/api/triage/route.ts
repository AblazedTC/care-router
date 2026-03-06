import { matchHospitals, triageFromSymptoms } from "@/lib/triage-engine"
import type { TriageCondition } from "@/lib/mock-data"

const BACKEND_TRIAGE_URL =
  process.env.BACKEND_TRIAGE_URL ?? "http://localhost:8000/api/triage"

function defaultCondition(symptoms: string): TriageCondition {
  return {
    name: "General Health Concern",
    severity: "moderate",
    specialty: ["General Medicine"],
    description:
      "More evaluation is recommended to confirm the diagnosis. A general medicine consult is a safe next step.",
    confidence: 0.5,
  }
}

export async function POST(request: Request) {
  try {
    const { symptoms } = await request.json()

    if (typeof symptoms !== "string" || !symptoms.trim()) {
      return Response.json({ error: "symptoms is required" }, { status: 400 })
    }

    try {
      const backendResponse = await fetch(BACKEND_TRIAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms }),
        signal: AbortSignal.timeout(8000),
      })

      if (backendResponse.ok) {
        const data = await backendResponse.json()
        return Response.json(data)
      }
    } catch {
      // Fall through to local inference if backend is unavailable.
    }

    const localCondition = triageFromSymptoms(symptoms) ?? defaultCondition(symptoms)
    const localHospitals = matchHospitals(localCondition)

    return Response.json({
      condition: localCondition,
      hospitals: localHospitals,
      source: "local-fallback",
    })
  } catch {
    return Response.json({ error: "Unable to process triage request" }, { status: 500 })
  }
}
