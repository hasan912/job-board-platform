"use client"

import type React from "react"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-900 via-neutral-900 to-black p-4">
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full -translate-x-1/2" />
  </div>

  <Card className="w-full max-w-md backdrop-blur-xl bg-black/40 border border-white/10 shadow-xl rounded-2xl">
    <CardHeader className="text-center space-y-2">
      <CardTitle className="text-2xl font-semibold text-white">Welcome Back 👋</CardTitle>
      <CardDescription className="text-zinc-400 text-sm">Sign in to continue to <span className="text-primary font-medium">Job Board</span></CardDescription>
    </CardHeader>

    <CardContent>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900/60 border border-zinc-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-white placeholder:text-zinc-500 transition-all"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900/60 border border-zinc-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-white placeholder:text-zinc-500 transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-primary text-black font-medium py-2 rounded-lg hover:bg-primary/80 transition-all duration-200"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-400 mt-6">
        Don’t have an account?{" "}
        <Link href="/auth/signup" className="text-primary font-medium hover:underline">
          Sign Up
        </Link>
      </p>
    </CardContent>
  </Card>
</div>
  )
}