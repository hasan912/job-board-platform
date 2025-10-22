"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  jobType: string
  applicants: string[]
  createdAt: any
}

export default function EmployerJobs() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "employer")) {
      router.push("/dashboard")
      return
    }

    if (user) {
      fetchJobs()
    }
  }, [user, loading, router, userProfile])

  const fetchJobs = async () => {
    try {
      const q = query(collection(db, "jobs"), where("employerId", "==", user?.uid))
      const snapshot = await getDocs(q)
      const jobsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[]
      setJobs(jobsList.sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.() || 0))
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoadingJobs(false)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteDoc(doc(db, "jobs", jobId))
        setJobs(jobs.filter((job) => job.id !== jobId))
      } catch (error) {
        console.error("Error deleting job:", error)
      }
    }
  }

  if (loading || loadingJobs) {
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
          <Link href="/jobs/create">
            <Button>Post New Job</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">My Job Postings</h1>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
              <Link href="/jobs/create">
                <Button>Post Your First Job</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.company}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{job.applicants?.length || 0} applicants</p>
                      <p className="text-xs text-muted-foreground capitalize">{job.jobType}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{job.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{job.salary || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/employer/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        View Applicants
                      </Button>
                    </Link>
                    <Link href={`/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)}>
                      Delete
                    </Button>
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
