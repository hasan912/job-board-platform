"use client"

import type React from "react"

import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"employer" | "applicant">("applicant")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
      })

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-900 via-neutral-900 to-black p-4 relative overflow-hidden">
  {/* background glow */}
  <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full -translate-x-1/2 -z-10" />

  <Card className="w-full max-w-md backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl rounded-2xl">
    <CardHeader className="text-center space-y-2">
      <CardTitle className="text-2xl font-semibold text-white">Create Account 🚀</CardTitle>
      <CardDescription className="text-zinc-400 text-sm">
        Join our <span className="text-primary font-medium">Job Board</span> community
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900/60 border border-zinc-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-white placeholder:text-zinc-500 transition-all"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900/60 border border-zinc-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-white placeholder:text-zinc-500 transition-all"
            placeholder="you@example.com"
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

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">I am a:</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2 text-zinc-300 bg-zinc-900/50 px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-800/60 transition-all">
              <input
                type="radio"
                value="applicant"
                checked={role === "applicant"}
                onChange={(e) => setRole(e.target.value as "applicant")}
                className="accent-primary"
              />
              <span>Job Applicant</span>
            </label>

            <label className="flex items-center gap-2 text-zinc-300 bg-zinc-900/50 px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-800/60 transition-all">
              <input
                type="radio"
                value="employer"
                checked={role === "employer"}
                onChange={(e) => setRole(e.target.value as "employer")}
                className="accent-primary"
              />
              <span>Employer</span>
            </label>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-primary text-black font-medium py-2 rounded-lg hover:bg-primary/80 transition-all duration-200"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-400 mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </CardContent>
  </Card>
</div>

  )
}
