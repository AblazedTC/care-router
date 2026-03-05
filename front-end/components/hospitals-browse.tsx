"use client"

import { MapPin, Star, BedDouble, Clock, Zap, Search } from "lucide-react"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { hospitals } from "@/lib/mock-data"

export function HospitalsBrowse() {
  const [search, setSearch] = useState("")

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.specialty.some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      ) ||
      h.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search hospitals or specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} of {hospitals.length}
        </span>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pr-3">
          {filtered.map((hospital) => (
            <div
              key={hospital.id}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className="font-semibold text-sm text-foreground truncate"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {hospital.name}
                    </h3>
                    {hospital.emergency && (
                      <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                        <Zap className="w-2.5 h-2.5 inline mr-0.5" />
                        ER
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{hospital.address}</span>
                  </p>
                </div>
                <span className="flex items-center gap-0.5 text-xs font-medium text-foreground shrink-0">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                  {hospital.rating}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {hospital.specialty.map((spec) => (
                  <span
                    key={spec}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-foreground">
                    {hospital.availableBeds}
                  </span>{" "}
                  beds
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {hospital.waitTime}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {hospital.distance} km
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-sm text-muted-foreground">
                No hospitals match your search.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
