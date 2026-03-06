"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Activity,
  Stethoscope,
  Building2,
  FileText,
  ShieldCheck,
  RotateCcw,
  LogOut,
  User,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AuthPage } from "@/components/auth-page"
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
import { GuestInfoForm, type GuestInfo } from "@/components/guest-info-form"
import type { TriageCondition } from "@/lib/mock-data"
import {
  triageFromSymptoms,
  matchHospitals,
  type ScoredHospital,
} from "@/lib/triage-engine"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function HomePage() {
  const { user, token, isAuthenticated, isGuest, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("triage")
  const [isProcessing, setIsProcessing] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [condition, setCondition] = useState<TriageCondition | null>(null)
  const [hospitals, setHospitals] = useState<ScoredHospital[]>([])
  const [selectedHospital, setSelectedHospital] =
    useState<ScoredHospital | null>(null)
  const [referralToken, setReferralToken] = useState("")
  const [referralIssuedAt, setReferralIssuedAt] = useState<Date | undefined>()
  const [referralExpiresAt, setReferralExpiresAt] = useState<Date | undefined>()
  const [showReferral, setShowReferral] = useState(false)
  const [referrals, setReferrals] = useState<ReferralRecord[]>([])

  // Guest info form state
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [pendingHospital, setPendingHospital] = useState<ScoredHospital | null>(
    null
  )

  // Fetch referral history for authenticated users
  const fetchReferrals = useCallback(async () => {
    if (!isAuthenticated || !token) return
    try {
      const res = await fetch(`${API_URL}/referrals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setReferrals(
          data.map((r: Record<string, string>) => ({
            token: r.token,
            hospitalName: r.hospitalName,
            conditionName: r.conditionName,
            severity: r.severity,
            issuedAt: new Date(r.issuedAt),
            expiresAt: new Date(r.expiresAt),
          }))
        )
      }
    } catch {
      // silently fail — referral history is non-critical
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    fetchReferrals()
  }, [fetchReferrals])

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
    if (isGuest) {
      // Guest users need to fill out info first
      setPendingHospital(hospital)
      setShowGuestForm(true)
      return
    }
    // Authenticated user — create referral directly
    createReferralOnServer(hospital, undefined)
  }

  async function createReferralOnServer(
    hospital: ScoredHospital,
    guestInfo: GuestInfo | undefined
  ) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const body: Record<string, unknown> = {
      hospitalId: hospital.id,
      conditionName: condition?.name ?? "Unknown",
      severity: condition?.severity ?? "moderate",
    }
    if (guestInfo) {
      body.guestInfo = guestInfo
    }

    try {
      const res = await fetch(`${API_URL}/referrals`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.detail || "Failed to create referral")
        return
      }

      const referral = await res.json()

      setSelectedHospital(hospital)
      setReferralToken(referral.token)
      setReferralIssuedAt(new Date(referral.issuedAt))
      setReferralExpiresAt(new Date(referral.expiresAt))
      setShowReferral(true)

      const record: ReferralRecord = {
        token: referral.token,
        hospitalName: referral.hospitalName,
        conditionName: referral.conditionName,
        severity: referral.severity,
        issuedAt: new Date(referral.issuedAt),
        expiresAt: new Date(referral.expiresAt),
      }

      setReferrals((prev) => [record, ...prev])
    } catch {
      toast.error("Network error — could not create referral")
    }
  }

  function handleGuestInfoSubmit(info: GuestInfo) {
    setShowGuestForm(false)
    if (pendingHospital) {
      createReferralOnServer(pendingHospital, info)
      setPendingHospital(null)
    }
  }

  function handleReset() {
    setCondition(null)
    setHospitals([])
    setUserInput("")
    setSelectedHospital(null)
    setReferralToken("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-10 h-10 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated && !isGuest) {
    return <AuthPage />
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

          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              {isGuest ? "Guest" : user?.name}
            </span>
            <button
              onClick={logout}
              className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
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
        issuedAt={referralIssuedAt}
        expiresAt={referralExpiresAt}
      />

      {/* Guest Info Form */}
      <GuestInfoForm
        open={showGuestForm}
        onOpenChange={setShowGuestForm}
        onSubmit={handleGuestInfoSubmit}
      />
    </div>
  )
}
