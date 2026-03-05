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
import { DashboardStats } from "@/components/dashboard-stats"
import { SymptomInput } from "@/components/symptom-input"
import { TriageResult } from "@/components/triage-result"
import { HospitalList } from "@/components/hospital-list"
import { HospitalsBrowse } from "@/components/hospitals-browse"
import { ReferralHistory, type ReferralRecord } from "@/components/referral-history"
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
      {/* Top header bar */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1
                className="text-base font-semibold tracking-tight text-foreground leading-none"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                MediRoute
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Smart Hospital Referral System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              System Online
            </span>
            <p className="text-[10px] text-muted-foreground max-w-xs hidden md:block">
              Mock prototype for demonstration only
            </p>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="shrink-0 px-5 py-3 border-b border-border bg-card/50">
        <DashboardStats />
      </div>

      {/* Tabs + Content area fills remaining space */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="shrink-0 px-5 pt-3 border-b border-border bg-card/30">
          <TabsList className="h-9">
            <TabsTrigger value="triage" className="gap-1.5 text-xs px-4">
              <Stethoscope className="w-3.5 h-3.5" />
              Triage
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="gap-1.5 text-xs px-4">
              <Building2 className="w-3.5 h-3.5" />
              Hospitals
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-1.5 text-xs px-4">
              <FileText className="w-3.5 h-3.5" />
              Referrals
              {referrals.length > 0 && (
                <span className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                  {referrals.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Triage Tab */}
        <TabsContent
          value="triage"
          className="flex-1 min-h-0 p-5 data-[state=inactive]:hidden"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p
                  className="text-sm font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Analyzing symptoms...
                </p>
                <p className="text-xs text-muted-foreground">
                  Running triage assessment and matching hospitals
                </p>
              </div>
            </div>
          ) : condition ? (
            <div className="flex gap-5 h-full">
              {/* Left: Triage assessment + input */}
              <div className="w-80 shrink-0 flex flex-col gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <TriageResult condition={condition} userInput={userInput} />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1.5 self-start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New Assessment
                </Button>
              </div>
              {/* Right: Hospital matches */}
              <div className="flex-1 min-w-0 min-h-0">
                <HospitalList
                  hospitals={hospitals}
                  onGenerateReferral={handleGenerateReferral}
                  selectedHospitalId={selectedHospital?.id ?? null}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-xl">
                <div className="rounded-xl border border-border bg-card p-6 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <Stethoscope className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2
                        className="text-sm font-semibold text-foreground"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        Symptom Analysis
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        Describe symptoms or enter a known diagnosis
                      </p>
                    </div>
                  </div>
                  <SymptomInput
                    onSubmit={handleSymptomSubmit}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Hospitals Tab */}
        <TabsContent
          value="hospitals"
          className="flex-1 min-h-0 p-5 data-[state=inactive]:hidden"
        >
          <HospitalsBrowse />
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent
          value="referrals"
          className="flex-1 min-h-0 p-5 data-[state=inactive]:hidden"
        >
          <ReferralHistory
            referrals={referrals}
            onClearAll={() => setReferrals([])}
          />
        </TabsContent>
      </Tabs>

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
