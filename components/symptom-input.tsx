"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface SymptomInputProps {
  onSubmit: (input: string) => void
  isProcessing: boolean
}

const EXAMPLE_SYMPTOMS = [
  "Chest pain and shortness of breath",
  "Severe headache with dizziness",
  "Broken arm with swelling",
  "Fever and sore throat",
  "Skin rash with itching",
  "Anxiety and insomnia",
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

  function handleExampleClick(example: string) {
    setInput(example)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="relative flex-1 min-h-0">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., I have a severe headache with dizziness and blurred vision..."
          className="h-full min-h-0 pr-10 text-sm resize-none bg-background border-border focus:border-primary transition-colors"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit()
            }
          }}
        />
        {input && (
          <button
            onClick={() => setInput("")}
            className="absolute top-2.5 right-2.5 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isListening && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex gap-0.5">
            <span className="w-1 h-3 bg-destructive rounded-full animate-pulse" />
            <span className="w-1 h-3 bg-destructive rounded-full animate-pulse delay-75" />
            <span className="w-1 h-3 bg-destructive rounded-full animate-pulse delay-150" />
          </div>
          <span className="text-xs text-destructive font-medium">
            Listening...
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isProcessing || !input.trim()}
          size="sm"
          className="gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          {isProcessing ? "Analyzing..." : "Analyze"}
        </Button>

        {speechSupported && (
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            onClick={isListening ? stopListening : startListening}
            className="gap-1.5"
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                Voice
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Quick examples
        </p>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_SYMPTOMS.map((example) => (
            <Badge
              key={example}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-[11px] py-1 px-2"
              onClick={() => handleExampleClick(example)}
            >
              {example}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
