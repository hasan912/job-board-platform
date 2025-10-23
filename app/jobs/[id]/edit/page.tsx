"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

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
            <CardTitle>Edit Job</CardTitle>
            <CardDescription>Update the job details</CardDescription>
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
                  {submitting ? "Saving..." : "Save Changes"}
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
