"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CreateJob() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    salary: "",
    jobType: "full-time",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || userProfile?.role !== "employer") {
    router.push("/dashboard")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await addDoc(collection(db, "jobs"), {
        ...formData,
        employerId: user.uid,
        employerName: userProfile.name,
        employerEmail: user.email,
        createdAt: serverTimestamp(),
        applicants: [],
      })

      router.push("/employer/jobs")
    } catch (err: any) {
      setError(err.message || "Failed to create job")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold hover:opacity-80">
            Job Board
          </Link>
          <Link href="/employer/jobs">
            <Button variant="outline">Back to Jobs</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Post a New Job</CardTitle>
            <CardDescription>Fill in the details about your job opening</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., New York, NY or Remote"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Salary Range</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g., $50k - $80k"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Job Type</label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="Describe the job responsibilities, requirements, and benefits..."
                  required
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Publishing..." : "Publish Job"}
                </Button>
                <Link href="/employer/jobs">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
