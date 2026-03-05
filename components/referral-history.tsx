"use client"

import { Copy, CheckCircle2, FileText, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

export function ReferralHistory({ referrals, onClearAll }: ReferralHistoryProps) {
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
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <FileText className="w-7 h-7 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p
            className="text-sm font-semibold text-foreground"
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
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3
            className="text-sm font-semibold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Referral History
          </h3>
          <Badge variant="secondary" className="text-[10px] h-5">
            {referrals.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] h-7 gap-1 text-muted-foreground hover:text-destructive"
          onClick={onClearAll}
        >
          <Trash2 className="w-3 h-3" />
          Clear All
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2 pr-3">
          {referrals.map((ref) => {
            const isExpired = ref.expiresAt < new Date()
            return (
              <div
                key={ref.token}
                className={`rounded-lg border p-4 space-y-3 ${
                  isExpired
                    ? "bg-muted/50 border-border/50 opacity-70"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p
                      className="font-semibold text-sm text-foreground"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {ref.hospitalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ref.conditionName}
                    </p>
                  </div>
                  <Badge
                    variant={isExpired ? "secondary" : "default"}
                    className="text-[10px] shrink-0"
                  >
                    {isExpired ? "Expired" : "Active"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-2 p-2.5 rounded-md bg-primary/5 border border-dashed border-primary/20">
                  <p className="font-mono text-sm font-bold tracking-wider text-primary">
                    {ref.token}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={() => copyToken(ref.token)}
                  >
                    {copiedToken === ref.token ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
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
