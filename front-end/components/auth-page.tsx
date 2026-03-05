"use client"

import { useState } from "react"
import { Activity, LogIn, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export function AuthPage() {
  const { login, register, loginAsGuest } = useAuth()
  const [activeTab, setActiveTab] = useState("login")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirm, setRegConfirm] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields")
      return
    }
    setIsSubmitting(true)
    try {
      await login(loginEmail, loginPassword)
      toast.success("Welcome back!")
    } catch (err: any) {
      toast.error(err.message || "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      toast.error("Please fill in all fields")
      return
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (regPassword !== regConfirm) {
      toast.error("Passwords do not match")
      return
    }
    setIsSubmitting(true)
    try {
      await register(regName, regEmail, regPassword)
      toast.success("Account created!")
    } catch (err: any) {
      toast.error(err.message || "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleGuest() {
    loginAsGuest()
    toast.success("Continuing as guest")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
            <Activity className="w-6 h-6" />
          </div>
          <div className="text-center">
            <h1
              className="text-2xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              MediRoute
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Smart Hospital Referral System
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <Card>
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1 gap-1.5 text-sm">
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="flex-1 gap-1.5 text-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="space-y-4">
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in…" : "Sign In"}
                </Button>
              </form>
            )}

            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account…" : "Create Account"}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Guest Button */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleGuest}
            >
              <Users className="w-4 h-4" />
              Continue as Guest
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
