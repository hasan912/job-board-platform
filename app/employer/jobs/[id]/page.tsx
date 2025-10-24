"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface Application {
  applicantId: string
  applicantName: string
  applicantEmail: string
  coverLetter: string
  resumeLink: string
  appliedAt: any
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  description: string
  jobType: string
  applications: Application[]
}

export default function JobApplicants() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const [job, setJob] = useState<Job | null>(null)
  const [loadingJob, setLoadingJob] = useState(true)

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "employer")) {
      router.push("/dashboard")
      return
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId, user, loading, router, userProfile])

  const fetchJob = async () => {
    try {
      const docSnap = await getDoc(doc(db, "jobs", jobId))
      if (docSnap.exists()) {
        setJob({ id: docSnap.id, ...docSnap.data() } as Job)
      }
    } catch (error) {
      console.error("Error fetching job:", error)
    } finally {
      setLoadingJob(false)
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

  const applications = job.applications || []

  return (
    <div className="min-h-screen bg-background">
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
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <p className="text-muted-foreground">{job.company}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Applicants</p>
              <p className="text-3xl font-bold">{applications.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-lg font-semibold">{job.location}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Job Type</p>
              <p className="text-lg font-semibold capitalize">{job.jobType}</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-4">Applicants</h2>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No applications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{app.applicantName}</CardTitle>
                      <CardDescription>{app.applicantEmail}</CardDescription>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {app.appliedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Cover Letter</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.coverLetter}</p>
                  </div>
                  {app.resumeLink && (
                    <a href={app.resumeLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        View Resume
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
