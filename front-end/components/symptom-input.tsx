"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, ArrowRight, X, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface SymptomInputProps {
  onSubmit: (input: string) => void
  isProcessing: boolean
}

const EXAMPLES = [
  "Chest pain and shortness of breath",
  "Severe headache with dizziness",
  "Broken arm with swelling",
  "Persistent cough and fever",
  "Skin rash with itching",
  "Anxiety and trouble sleeping",
]

export function SymptomInput({ onSubmit, isProcessing }: SymptomInputProps) {
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    setSpeechSupported(supported)
  }, [])

  function startListening() {
    if (!speechSupported) {
      toast.error("Voice input is not supported in this browser")
      return
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ""
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInput(transcript)
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast.error("Voice recognition error. Please try again.")
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    toast.info("Listening... Speak your symptoms")
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  function handleSubmit() {
    if (!input.trim()) {
      toast.warning("Please enter your symptoms or diagnosis")
      return
    }
    onSubmit(input.trim())
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
          <Stethoscope className="w-6 h-6 text-primary" />
        </div>
        <h2
          className="text-2xl font-semibold text-foreground tracking-tight text-balance"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          What are you experiencing?
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto text-pretty">
          Describe your symptoms in detail or enter a known diagnosis. We will
          match you with the best hospital.
        </p>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., I have a severe headache with dizziness and blurred vision..."
          rows={5}
          className="w-full rounded-xl border border-border bg-card px-5 py-4 text-base text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit()
            }
          }}
        />
        {input && (
          <button
            onClick={() => setInput("")}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Clear input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div className="flex items-center justify-center gap-2.5 -mt-4">
          <span className="flex gap-0.5">
            <span className="w-1 h-4 bg-destructive rounded-full animate-pulse" />
            <span className="w-1 h-4 bg-destructive rounded-full animate-pulse delay-75" />
            <span className="w-1 h-4 bg-destructive rounded-full animate-pulse delay-150" />
          </span>
          <span className="text-sm text-destructive font-medium">
            Listening...
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isProcessing || !input.trim()}
          size="lg"
          className="gap-2 px-8 rounded-xl h-11"
        >
          Analyze Symptoms
          <ArrowRight className="w-4 h-4" />
        </Button>

        {speechSupported && (
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="lg"
            onClick={isListening ? stopListening : startListening}
            className="gap-2 rounded-xl h-11"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Voice
              </>
            )}
          </Button>
        )}
      </div>

      {/* Example chips */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground text-center">
          Or try an example
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              onClick={() => {
                setInput(example)
                textareaRef.current?.focus()
              }}
              className="px-3 py-1.5 text-xs rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
