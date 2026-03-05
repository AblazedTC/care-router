"use client"

import { useState } from "react"
import {
  Activity,
  Stethoscope,
  Building2,
  FileText,
  ShieldCheck,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { SymptomInput } from "@/components/symptom-input"
import { TriageResult } from "@/components/triage-result"
import { HospitalList } from "@/components/hospital-list"
import { HospitalsBrowse } from "@/components/hospitals-browse"
import {
  ReferralHistory,
  type ReferralRecord,
} from "@/components/referral-history"
import { ReferralModal } from "@/components/referral-modal"
import type { TriageCondition } from "@/lib/mock-data"
import {
  triageFromSymptoms,
  matchHospitals,
  generateReferralToken,
  type ScoredHospital,
} from "@/lib/triage-engine"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("triage")
  const [isProcessing, setIsProcessing] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [condition, setCondition] = useState<TriageCondition | null>(null)
  const [hospitals, setHospitals] = useState<ScoredHospital[]>([])
  const [selectedHospital, setSelectedHospital] =
    useState<ScoredHospital | null>(null)
  const [referralToken, setReferralToken] = useState("")
  const [showReferral, setShowReferral] = useState(false)
  const [referrals, setReferrals] = useState<ReferralRecord[]>([])

  async function handleSymptomSubmit(input: string) {
    setIsProcessing(true)
    setUserInput(input)
    setSelectedHospital(null)
    setReferralToken("")

    await new Promise((resolve) => setTimeout(resolve, 1200))

    const result = triageFromSymptoms(input)

    if (!result) {
      toast.error(
        "Could not identify a condition. Try describing symptoms differently."
      )
      setCondition(null)
      setHospitals([])
      setIsProcessing(false)
      return
    }

    setCondition(result)
    const matched = matchHospitals(result)
    setHospitals(matched)
    setIsProcessing(false)

    if (matched.length > 0) {
      toast.success(`Found ${matched.length} matching hospitals`)
    }
  }

  function handleGenerateReferral(hospital: ScoredHospital) {
    const token = generateReferralToken()
    setSelectedHospital(hospital)
    setReferralToken(token)
    setShowReferral(true)

    const now = new Date()
    setReferrals((prev) => [
      {
        token,
        hospitalName: hospital.name,
        conditionName: condition?.name ?? "Unknown",
        severity: condition?.severity ?? "moderate",
        issuedAt: now,
        expiresAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
      },
      ...prev,
    ])
  }

  function handleReset() {
    setCondition(null)
    setHospitals([])
    setUserInput("")
    setSelectedHospital(null)
    setReferralToken("")
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Minimal header */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Activity className="w-4 h-4" />
            </div>
            <h1
              className="text-base font-semibold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              MediRoute
            </h1>
          </div>

          {/* Tabs in header */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="hidden sm:block"
          >
            <TabsList className="h-9 bg-transparent p-0 gap-1">
              <TabsTrigger
                value="triage"
                className="gap-1.5 text-xs px-3 data-[state=active]:bg-secondary data-[state=active]:shadow-none rounded-lg"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Triage
              </TabsTrigger>
              <TabsTrigger
                value="hospitals"
                className="gap-1.5 text-xs px-3 data-[state=active]:bg-secondary data-[state=active]:shadow-none rounded-lg"
              >
                <Building2 className="w-3.5 h-3.5" />
                Hospitals
              </TabsTrigger>
              <TabsTrigger
                value="referrals"
                className="gap-1.5 text-xs px-3 data-[state=active]:bg-secondary data-[state=active]:shadow-none rounded-lg"
              >
                <FileText className="w-3.5 h-3.5" />
                Referrals
                {referrals.length > 0 && (
                  <span className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                    {referrals.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <span className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Online
          </span>
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden border-t border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start h-10 bg-transparent rounded-none px-4 gap-1">
              <TabsTrigger value="triage" className="gap-1 text-xs">
                <Stethoscope className="w-3.5 h-3.5" />
                Triage
              </TabsTrigger>
              <TabsTrigger value="hospitals" className="gap-1 text-xs">
                <Building2 className="w-3.5 h-3.5" />
                Hospitals
              </TabsTrigger>
              <TabsTrigger value="referrals" className="gap-1 text-xs">
                <FileText className="w-3.5 h-3.5" />
                Referrals
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Content area */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {/* Triage */}
        {activeTab === "triage" && (
          <div className="h-full">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Analyzing symptoms...
                </p>
              </div>
            ) : condition ? (
              <div className="flex flex-col lg:flex-row h-full">
                {/* Left panel: assessment */}
                <div className="shrink-0 lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-border p-5 flex flex-col gap-4 overflow-y-auto">
                  <TriageResult condition={condition} userInput={userInput} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start over
                  </Button>
                </div>
                {/* Right panel: hospitals */}
                <div className="flex-1 min-w-0 min-h-0 p-5">
                  <HospitalList
                    hospitals={hospitals}
                    onGenerateReferral={handleGenerateReferral}
                    selectedHospitalId={selectedHospital?.id ?? null}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-6">
                <div className="w-full max-w-2xl">
                  <SymptomInput
                    onSubmit={handleSymptomSubmit}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hospitals */}
        {activeTab === "hospitals" && (
          <div className="h-full p-5">
            <HospitalsBrowse />
          </div>
        )}

        {/* Referrals */}
        {activeTab === "referrals" && (
          <div className="h-full p-5">
            <ReferralHistory
              referrals={referrals}
              onClearAll={() => setReferrals([])}
            />
          </div>
        )}
      </main>

      {/* Referral Modal */}
      <ReferralModal
        open={showReferral}
        onOpenChange={setShowReferral}
        hospital={selectedHospital}
        condition={condition}
        referralToken={referralToken}
      />
    </div>
  )
}
