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
import { ThemeToggle } from "@/components/ui/theme-toggle"

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <nav className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">Job Board</h1>
          <div className="flex gap-3 items-center">
            <Link href="/employer/jobs">
              <Button variant="ghost" size="sm" className="hover:bg-accent">Back To Job</Button>
            </Link>
            <Link href={"/dashboard"}>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              Dashboard
            </Button>
            </Link>
            <ThemeToggle/>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-primary/60 text-transparent bg-clip-text mb-2">
              Create Your Job Posting
            </h1>
            <p className="text-muted-foreground">Reach out to thousands of qualified candidates</p>
          </div>

          <Card className="border-primary/20 shadow-lg shadow-primary/5 bg-background/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 border-b border-border/40 bg-muted/30">
              <div className="flex items-center gap-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <CardTitle>Job Details</CardTitle>
              </div>
              <CardDescription>Make your job posting stand out with detailed information</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                      Job Title
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                      Company Name
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Your company name"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      Location
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., New York, NY or Remote"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z"/></svg>
                      Job Type
                      <span className="text-destructive">*</span>
                    </label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="Remote">Remote</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                    Salary Range
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g., $50k - $80k per year"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                    Job Description
                    <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={8}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-y"
                      placeholder="Describe the job responsibilities, requirements, and benefits..."
                      required
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                      {formData.description.length} characters
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-lg p-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-border/40">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 py-6 text-lg font-medium relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {submitting ? (
                        <>
                          <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                          Publish Job
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 transform -skew-x-12 group-hover:animate-shimmer transition-all duration-1000"/>
                  </Button>
                  <Link href="/employer/jobs" className="flex-1">
                    <Button type="button" variant="outline" className="w-full py-6 text-lg font-medium">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

