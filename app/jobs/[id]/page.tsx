"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  description: string
  jobType: string
  employerName: string
  employerEmail: string
  applications: any[]
}

export default function JobDetail() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const [job, setJob] = useState<Job | null>(null)
  const [loadingJob, setLoadingJob] = useState(true)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [formData, setFormData] = useState({
    coverLetter: "",
    resumeLink: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId, user, loading, router])

  const fetchJob = async () => {
    try {
      const docSnap = await getDoc(doc(db, "jobs", jobId))
      if (docSnap.exists()) {
        const jobData = { id: docSnap.id, ...docSnap.data() } as Job
        setJob(jobData)

        // Check if user has already applied
        const alreadyApplied = jobData.applications?.some((app) => app.applicantId === user?.uid)
        setHasApplied(alreadyApplied || false)
      }
    } catch (error) {
      console.error("Error fetching job:", error)
    } finally {
      setLoadingJob(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      if (!user || !userProfile) {
        setError("User information not available")
        return
      }

      const application = {
        applicantId: user.uid,
        applicantName: userProfile.name,
        applicantEmail: user.email,
        coverLetter: formData.coverLetter,
        resumeLink: formData.resumeLink,
        appliedAt: new Date(),
      }

      await updateDoc(doc(db, "jobs", jobId), {
        applications: arrayUnion(application),
      })

      setHasApplied(true)
      setShowApplicationForm(false)
      setFormData({ coverLetter: "", resumeLink: "" })
      await fetchJob()
    } catch (err: any) {
      setError(err.message || "Failed to submit application")
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

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
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
          <Link href="/jobs">
            <Button variant="outline">Back to Jobs</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{job.title}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="font-medium">{job.salary || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium capitalize">{job.jobType}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Posted by</p>
                  <p className="font-medium">{job.employerName}</p>
                  <p className="text-sm text-muted-foreground">{job.employerEmail}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Apply Now</CardTitle>
              </CardHeader>
              <CardContent>
                {hasApplied ? (
                  <div className="text-center py-4">
                    <p className="text-green-600 font-medium mb-2">✓ You have applied</p>
                    <p className="text-sm text-muted-foreground">Check your applications for updates</p>
                  </div>
                ) : (
                  <>
                    {!showApplicationForm ? (
                      <Button onClick={() => setShowApplicationForm(true)} className="w-full">
                        Apply for this job
                      </Button>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Cover Letter</label>
                          <textarea
                            name="coverLetter"
                            value={formData.coverLetter}
                            onChange={handleChange}
                            rows={5}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                            placeholder="Tell us why you're interested in this position..."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Resume Link</label>
                          <input
                            type="url"
                            name="resumeLink"
                            value={formData.resumeLink}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                            placeholder="https://example.com/resume.pdf"
                          />
                        </div>

                        {error && <p className="text-destructive text-sm">{error}</p>}

                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => setShowApplicationForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
