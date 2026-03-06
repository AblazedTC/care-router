"use client"

import { useState } from "react"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProfileDialog } from "@/components/profile-dialog"
import { useAuth } from "@/lib/auth-context"

export function ProfileMenu() {
  const { user, isGuest, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors outline-none">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline max-w-[120px] truncate">
              {isGuest ? "Guest" : user?.name}
            </span>
            <ChevronDown className="w-3 h-3 hidden md:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {isGuest ? "Guest User" : user?.name}
              </p>
              {!isGuest && user?.email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!isGuest && (
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
                <Settings className="w-4 h-4" />
                Profile Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}
          {!isGuest && <DropdownMenuSeparator />}
          <DropdownMenuItem variant="destructive" onSelect={logout}>
            <LogOut className="w-4 h-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {!isGuest && (
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      )}
    </>
  )
}
