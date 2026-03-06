import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Keywords that indicate specific symptoms requiring minimal follow-up
const SPECIFIC_KEYWORDS = [
  "chest pain",
  "broken",
  "fracture",
  "fever",
  "cough",
  "headache",
  "dizziness",
  "rash",
  "vomiting",
  "diarrhea",
  "nausea",
  "bleeding",
  "injury",
  "swelling",
  "pain",
  "difficulty breathing",
  "shortness of breath",
  "asthma",
  "diabetes",
  "pneumonia",
  "concussion",
  "appendicitis",
]

type FollowUpFocus =
  | "injury"
  | "headache"
  | "respiratory"
  | "abdominal"
  | "chest"
  | "skin"
  | "general"

const FOCUS_KEYWORDS: Record<FollowUpFocus, string[]> = {
  injury: [
    "fell",
    "fell off",
    "fall",
    "fall off",
    "bike",
    "scooter",
    "car",
    "i fell off my bike",
    "vehicle",
    "accident",
    "injury",
    "twisted",
    "sprain",
    "fracture",
    "broken",
    "hit",
    "crash",
  ],
  headache: ["headache", "migraine", "head pain", "head hurts", "head hurting", "pressure in head", "dizzy", "dizziness", "lightheaded"],
  respiratory: [
    "cough",
    "breath",
    "breathing",
    "wheezing",
    "asthma",
    "shortness of breath",
  ],
  abdominal: ["stomach", "abdomen", "nausea", "vomiting", "diarrhea", "cramps"],
  chest: ["chest pain", "chest", "palpitations", "heart", "pressure"],
  skin: ["rash", "itch", "hives", "skin", "swelling"],
  general: [],
}

function detectFollowUpFocus(symptoms: string): FollowUpFocus {
  const lower = symptoms.toLowerCase()

  const orderedFocuses: FollowUpFocus[] = [
    "chest",
    "injury",
    "headache",
    "respiratory",
    "abdominal",
    "skin",
  ]

  for (const focus of orderedFocuses) {
    if (FOCUS_KEYWORDS[focus].some((keyword) => lower.includes(keyword))) {
      return focus
    }
  }

  return "general"
}

function fallbackQuestions(symptoms: string, focus: FollowUpFocus): string[] {
  switch (focus) {
    case "injury":
      return [
        "How did the incident happen, and which body part was injured?",
        "Can you bear weight or move the injured area normally?",
        "Do you have ongoing pain, swelling, numbness, or visible deformity?",
      ]
    case "headache":
      return [
        "When did the headache start, and is it constant or intermittent?",
        "How severe is it (0-10), and is it worse with light, sound, or movement?",
        "Any associated symptoms like nausea, vision changes, weakness, or fever?",
      ]
    case "respiratory":
      return [
        "How long have your breathing or cough symptoms been present?",
        "Are you experiencing chest tightness, wheezing, or shortness of breath at rest?",
        "Do you have fever, mucus production, or recent exposure to illness?",
      ]
    case "abdominal":
      return [
        "Where exactly is the abdominal pain/discomfort, and when did it begin?",
        "How severe is it (0-10), and does eating or movement make it better or worse?",
        "Any vomiting, diarrhea, fever, blood in stool, or inability to keep fluids down?",
      ]
    case "chest":
      return [
        "When did the chest symptom start, and is it constant or comes in episodes?",
        "Is the pain pressure-like, sharp, or spreading to jaw/arm/back?",
        "Any shortness of breath, sweating, dizziness, or nausea with it?",
      ]
    case "skin":
      return [
        "When did the skin issue start, and where on your body is it located?",
        "Is it painful, itchy, spreading, or associated with swelling?",
        "Any new medication, food, soap, or environmental exposure before this started?",
      ]
    default:
      return [
        "How long have these symptoms been present, and are they getting better or worse?",
        "Which symptom is most concerning right now, and how severe is it (0-10)?",
        "Any other new symptoms?",
      ]
  }
}

function parseQuestions(text: string): string[] {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "")
  try {
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) {
      return parsed.filter((q) => typeof q === "string").slice(0, 3)
    }
  } catch {
    return []
  }
  return []
}

export async function POST(request: Request) {
  try {
    const { symptoms } = await request.json()
    if (typeof symptoms !== "string" || !symptoms.trim()) {
      return Response.json(
        {
          questions: fallbackQuestions("", "general"),
          needsFollowUp: true,
          focus: "general",
        },
        { status: 400 }
      )
    }

    const lowerSymptoms = symptoms.toLowerCase()
    const focus = detectFollowUpFocus(symptoms)

    // Check if symptoms are clearly generic/vague
    const VAGUE_PHRASES = [
      "not feeling well",
      "don't feel good",
      "something's wrong",
      "not sure",
      "help",
      "sick",
      "unwell",
      "general",
      "weird",
      "odd",
      "strange",
    ]

    const isVague = VAGUE_PHRASES.some((phrase) =>
      lowerSymptoms.includes(phrase)
    )
    const hasSpecificKeyword = SPECIFIC_KEYWORDS.some((kw) =>
      lowerSymptoms.includes(kw)
    )
    const wordCount = symptoms.trim().split(/\s+/).length
    const hasFocusedSignal = focus !== "general"

    // Deterministic follow-up for short, focused reports.
    // Example: "I fell off my bike" or "headache" should use the focus fallback set directly.
    if (hasFocusedSignal && wordCount <= 6) {
      return Response.json({
        questions: fallbackQuestions(symptoms, focus),
        needsFollowUp: true,
        focus,
      })
    }

    // If short or generic, ask AI for follow-ups and fallback safely on parse issues.
    if (wordCount < 6 || (isVague && !hasSpecificKeyword)) {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "You are a medical triage assistant. Return ONLY a JSON array with exactly 3 concise, symptom-specific follow-up questions. Questions must directly reflect the symptom category and should clarify timeline, severity, and danger signs.",
        prompt: `Patient initial report: "${symptoms}"\nDetected focus category: ${focus}\n\nGenerate exactly 3 targeted follow-up questions for this patient.\nExamples:\n- If bike fall/injury: ask mechanism, injured area/function, lingering symptoms.\n- If headache: ask duration/pattern, severity and triggers, associated neurological symptoms.\n\nReturn JSON array only.`,
        temperature: 0.3,
      })

      const questions = parseQuestions(text)
      const finalQuestions =
        questions.length === 3 ? questions : fallbackQuestions(symptoms, focus)
      return Response.json({
        questions: finalQuestions,
        needsFollowUp: true,
        focus,
      })
    }

    // For specific symptoms, still check if AI thinks follow-up is needed
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a medical triage assistant. Decide whether the symptom report is sufficient for triage. If sufficient, return []. If more detail is needed, return exactly 3 targeted follow-up questions as JSON array.",
      prompt: `Symptoms: "${symptoms}"\nDetected focus category: ${focus}\n\nReturn only JSON array. If details are insufficient, ask focused follow-up questions that match this symptom type.`,
      temperature: 0.3,
    })

    const questions = parseQuestions(text)
    return Response.json({
      questions,
      needsFollowUp: questions.length > 0,
      focus,
    })
  } catch (error) {
    console.error("Assessment error:", error)
    // On error, still provide focused follow-up to avoid blocking care routing.
    return Response.json({
      questions: fallbackQuestions("", "general"),
      needsFollowUp: true,
      focus: "general",
    })
  }
}
