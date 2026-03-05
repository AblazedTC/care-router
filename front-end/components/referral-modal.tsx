"use client"

import { Copy, CheckCircle2, Printer, Download } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import type { ScoredHospital } from "@/lib/triage-engine"
import type { TriageCondition } from "@/lib/mock-data"

interface ReferralModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hospital: ScoredHospital | null
  condition: TriageCondition | null
  referralToken: string
}

export function ReferralModal({
  open,
  onOpenChange,
  hospital,
  condition,
  referralToken,
}: ReferralModalProps) {
  const [copied, setCopied] = useState(false)

  if (!hospital || !condition) return null

  function copyToken() {
    navigator.clipboard.writeText(referralToken)
    setCopied(true)
    toast.success("Referral token copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const now = new Date()
  const expiryDate = new Date(now.getTime() + 72 * 60 * 60 * 1000)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <CheckCircle2 className="w-5 h-5 text-success" />
            Referral Generated
          </DialogTitle>
          <DialogDescription>
            Present this token at the hospital reception for priority processing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-center p-4 rounded-xl bg-primary/5 border-2 border-dashed border-primary/30">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Referral Token
              </p>
              <p className="text-2xl font-mono font-bold tracking-widest text-primary">
                {referralToken}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={copyToken}
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied" : "Copy Token"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => {
                toast.info("Print referral feature coming soon")
              }}
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => {
                toast.info("Download referral feature coming soon")
              }}
            >
              <Download className="w-4 h-4" />
              Save
            </Button>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  Hospital
                </p>
                <p className="font-medium text-foreground">{hospital.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  Condition
                </p>
                <p className="font-medium text-foreground">{condition.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  Issued
                </p>
                <p className="font-medium text-foreground">
                  {now.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  Valid Until
                </p>
                <p className="font-medium text-foreground">
                  {expiryDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning-foreground leading-relaxed">
                This referral token is valid for 72 hours. Please present it at the
                hospital&apos;s reception desk along with a valid ID for verification.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
