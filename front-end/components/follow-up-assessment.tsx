"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type FollowUpFocus =
  | "injury"
  | "headache"
  | "respiratory"
  | "abdominal"
  | "chest"
  | "skin"
  | "general"

interface FollowUpAssessmentProps {
  questions: string[]
  onComplete: (answers: string[]) => void
  isProcessing: boolean
  focus?: FollowUpFocus
}

const FOCUS_CHIPS: Record<FollowUpFocus, string[]> = {
  injury: [
    "Road bike fall",
    "Left knee",
    "Right wrist",
    "Swelling",
    "Bruising",
    "Cannot bear weight",
  ],
  headache: [
    "Started today",
    "Throbbing",
    "8/10 severity",
    "Light sensitivity",
    "Nausea",
    "Vision changes",
  ],
  respiratory: [
    "Dry cough",
    "Wheezing",
    "Shortness of breath",
    "Fever",
    "Worse at night",
    "Sputum present",
  ],
  abdominal: [
    "Lower right abdomen",
    "Cramping",
    "After meals",
    "6/10 pain",
    "Vomiting",
    "Diarrhea",
  ],
  chest: [
    "Pressure-like pain",
    "Radiates to arm",
    "Comes in episodes",
    "Shortness of breath",
    "Sweating",
    "Dizziness",
  ],
  skin: [
    "Started 2 days ago",
    "Itchy",
    "Painful",
    "Spreading",
    "Red patches",
    "New soap exposure",
  ],
  general: [
    "Started today",
    "Getting worse",
    "Intermittent",
    "Mild",
    "Moderate",
    "Severe",
  ],
}

function getQuestionAwareChips(question: string, focus: FollowUpFocus): string[] {
  const lower = question.toLowerCase()

  if (lower.includes("how long") || lower.includes("when did")) {
    return ["Started today", "1-3 days", "1 week", "Over 2 weeks"]
  }

  if (lower.includes("severe") || lower.includes("0-10") || lower.includes("pain")) {
    return ["3/10", "5/10", "7/10", "9/10"]
  }

  return FOCUS_CHIPS[focus]
}

function appendChip(existingValue: string, chip: string): string {
  const trimmed = existingValue.trim()
  if (!trimmed) {
    return chip
  }
  if (trimmed.toLowerCase().includes(chip.toLowerCase())) {
    return existingValue
  }
  return `${existingValue}${existingValue.endsWith(" ") ? "" : " "}${chip}.`
}

export function FollowUpAssessment({
  questions,
  onComplete,
  isProcessing,
  focus = "general",
}: FollowUpAssessmentProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""))

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentIndex] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onComplete(answers)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const progress = ((currentIndex + 1) / questions.length) * 100
  const quickChips = getQuestionAwareChips(questions[currentIndex] ?? "", focus)

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Progress value={progress} className="h-2" />
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Question {currentIndex + 1} of {questions.length}
        </h2>
        <p
          id={`follow-up-question-${currentIndex}`}
          className="text-base text-muted-foreground"
        >
          {questions[currentIndex]}
        </p>
        <textarea
          value={answers[currentIndex]}
          onChange={(e) => handleAnswer(e.target.value)}
          placeholder="Add details here (for example: duration, severity, triggers, and anything that improves/worsens symptoms)."
          rows={4}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          aria-describedby={`follow-up-question-${currentIndex}`}
        />
        <div className="flex flex-wrap gap-2">
          {quickChips.map((chip) => (
            <Button
              key={chip}
              type="button"
              variant="outline"
              onClick={() => handleAnswer(appendChip(answers[currentIndex], chip))}
              className="h-8"
            >
              {chip}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!answers[currentIndex].trim() || isProcessing}
        >
          {currentIndex === questions.length - 1 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  )
}
