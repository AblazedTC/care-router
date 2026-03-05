"use client"

import { Copy, CheckCircle2, FileText, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

export interface ReferralRecord {
  token: string
  hospitalName: string
  conditionName: string
  severity: string
  issuedAt: Date
  expiresAt: Date
}

interface ReferralHistoryProps {
  referrals: ReferralRecord[]
  onClearAll: () => void
}

export function ReferralHistory({
  referrals,
  onClearAll,
}: ReferralHistoryProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  function copyToken(token: string) {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    toast.success("Token copied")
    setTimeout(() => setCopiedToken(null), 2000)
  }

  if (referrals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <FileText className="w-8 h-8 text-muted-foreground/40" />
        <div className="text-center">
          <p
            className="text-sm font-medium text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            No referrals yet
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Generate a referral from the Triage tab by analyzing symptoms and
            selecting a hospital.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between shrink-0">
        <p className="text-sm text-muted-foreground">
          {referrals.length} referral{referrals.length !== 1 ? "s" : ""}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 gap-1.5 text-muted-foreground hover:text-destructive"
          onClick={onClearAll}
        >
          <Trash2 className="w-3 h-3" />
          Clear all
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pr-3">
          {referrals.map((ref) => {
            const isExpired = ref.expiresAt < new Date()
            return (
              <div
                key={ref.token}
                className={`rounded-xl border p-4 space-y-3 ${
                  isExpired
                    ? "bg-muted/30 border-border/50 opacity-60"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="font-semibold text-sm text-foreground truncate"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {ref.hospitalName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ref.conditionName}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isExpired
                        ? "bg-muted text-muted-foreground"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {isExpired ? "Expired" : "Active"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-dashed border-primary/20">
                  <p className="font-mono text-sm font-bold tracking-wider text-primary truncate">
                    {ref.token}
                  </p>
                  <button
                    className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => copyToken(ref.token)}
                    aria-label="Copy token"
                  >
                    {copiedToken === ref.token ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span>
                    Issued:{" "}
                    {ref.issuedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>
                    Expires:{" "}
                    {ref.expiresAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
