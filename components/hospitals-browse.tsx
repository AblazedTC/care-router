"use client"

import {
  MapPin,
  Star,
  BedDouble,
  Clock,
  Zap,
  Search,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search hospitals, specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {filtered.length} of {hospitals.length}
        </span>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2 pr-3">
          {filtered.map((hospital) => (
            <div
              key={hospital.id}
              className="rounded-lg border border-border bg-card p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3
                      className="font-semibold text-sm text-foreground"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {hospital.name}
                    </h3>
                    {hospital.emergency && (
                      <Badge
                        variant="destructive"
                        className="text-[9px] px-1 py-0 h-4"
                      >
                        <Zap className="w-2.5 h-2.5 mr-0.5" />
                        ER
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{hospital.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-xs font-medium text-foreground shrink-0">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                  {hospital.rating}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {hospital.specialty.map((spec) => (
                  <Badge
                    key={spec}
                    variant="secondary"
                    className="text-[10px] py-0 px-1.5 h-5"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-foreground">
                    {hospital.availableBeds}
                  </span>
                  beds
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {hospital.waitTime}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {hospital.distance} km
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8">
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
