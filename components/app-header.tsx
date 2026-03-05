"use client"

import { Activity } from "lucide-react"

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              MediRoute
            </h1>
            <p className="text-xs text-muted-foreground">
              Smart Hospital Referral System
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            System Online
          </span>
        </div>
      </div>
    </header>
  )
}
