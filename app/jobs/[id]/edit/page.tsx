"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function EditJobPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    salary: "",
    jobType: "full-time",
  })
  const [loadingJob, setLoadingJob] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (jobId) fetchJob()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, user, loading])

  const fetchJob = async () => {
    setLoadingJob(true)
    try {
      const snap = await getDoc(doc(db, "jobs", jobId))
      if (!snap.exists()) {
        setError("Job not found")
        return
      }

      const data = snap.data() as any

      // Only employer who created the job can edit
      if (user && data.employerId && user.uid !== data.employerId) {
        router.push("/dashboard")
        return
      }

      setFormData({
        title: data.title || "",
        company: data.company || "",
        description: data.description || "",
        location: data.location || "",
        salary: data.salary || "",
        jobType: data.jobType || "full-time",
      })
    } catch (err: any) {
      console.error("Error fetching job for edit:", err)
      setError(err.message || "Failed to load job")
    } finally {
      setLoadingJob(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      if (!user || !userProfile) {
        setError("User not available")
        return
      }

      await updateDoc(doc(db, "jobs", jobId), {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        location: formData.location,
        salary: formData.salary,
        jobType: formData.jobType,
        updatedAt: serverTimestamp(),
      })

      router.push("/employer/jobs")
    } catch (err: any) {
      console.error("Error updating job:", err)
      setError(err.message || "Failed to update job")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || loadingJob) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Job Board</h1>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/employer/jobs">
              <Button variant="ghost" size="sm" className="hover:bg-accent transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                 View My Job
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="hover:bg-accent transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Profile
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto shadow-lg transition-shadow duration-300 hover:shadow-xl">
          <CardHeader className="space-y-2 border-b border-border/40 pb-6">
            <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Edit Job Listing</CardTitle>
            <CardDescription className="text-muted-foreground">Update your job posting details below</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Job Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    placeholder="e.g., Tech Solutions Inc."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., New York, NY or Remote"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Salary Range</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g., $50k - $80k"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Job Type</label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Job Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 min-h-[200px]"
                  placeholder="Describe the job responsibilities, requirements, and benefits..."
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-border/40">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2.5 transition-all duration-200 hover:scale-105"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Link href="/employer/jobs">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="px-6 py-2.5 transition-all duration-200 hover:bg-accent"
                  >
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
