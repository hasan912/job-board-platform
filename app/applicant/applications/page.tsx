"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface Application {
  jobId: string
  jobTitle: string
  company: string
  location: string
  salary: string
  coverLetter: string
  resumeLink: string
  appliedAt: any
}

export default function MyApplications() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      fetchApplications()
    }
  }, [user, loading, router])

  const fetchApplications = async () => {
    try {
      const snapshot = await getDocs(collection(db, "jobs"))
      const allApplications: Application[] = []

      snapshot.docs.forEach((doc) => {
        const job = doc.data()
        const userApplications = job.applications?.filter((app: any) => app.applicantId === user?.uid) || []

        userApplications.forEach((app: any) => {
          allApplications.push({
            jobId: doc.id,
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            coverLetter: app.coverLetter,
            resumeLink: app.resumeLink,
            appliedAt: app.appliedAt,
          })
        })
      })

      setApplications(allApplications.sort((a, b) => b.appliedAt?.toDate?.() - a.appliedAt?.toDate?.() || 0))
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoadingApps(false)
    }
  }

  if (loading || loadingApps) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">Job Board</h1>
          <div className="flex gap-3 items-center">
            <Link href="/jobs">
              <Button variant="ghost" size="sm" className="hover:bg-accent">Browse Jobs</Button>
            </Link>
            <Link href={"/dashboard"}>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
              Dashboard
            </Button>
            </Link>
            <ThemeToggle/>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">My Applications</h1>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
              <Link href="/jobs">
                <Button>Browse Available Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{app.jobTitle}</CardTitle>
                      <CardDescription>{app.company}</CardDescription>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {app.appliedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{app.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{app.salary || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium text-primary">Applied</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Your Cover Letter</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{app.coverLetter}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/jobs/${app.jobId}`}>
                      <Button variant="outline" size="sm">
                        View Job
                      </Button>
                    </Link>
                    {app.resumeLink && (
                      <a href={app.resumeLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          View Resume
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
