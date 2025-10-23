"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function Dashboard() {
  const { user, userProfile, loading, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ jobs: 0, applications: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && userProfile) {
      fetchStats()
    }
  }, [user, userProfile])

  const fetchStats = async () => {
    try {
      if (userProfile?.role === "employer") {
        const q = query(collection(db, "jobs"), where("employerId", "==", user?.uid))
        const snapshot = await getDocs(q)
        let totalApplications = 0
        snapshot.docs.forEach((doc) => {
          totalApplications += doc.data().applications?.length || 0
        })
        setStats({ jobs: snapshot.size, applications: totalApplications })
      } else {
        const snapshot = await getDocs(collection(db, "jobs"))
        let applicationCount = 0
        snapshot.docs.forEach((doc) => {
          const applications = doc.data().applications?.filter((app: any) => app.applicantId === user?.uid) || []
          applicationCount += applications.length
        })
        setStats({ jobs: 0, applications: applicationCount })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Job Board</h1>
          <div className="flex gap-4 items-center">
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
            <ThemeToggle/>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome, {userProfile.name}!</h2>
            <p className="text-muted-foreground">
              You are logged in as an <span className="font-semibold capitalize">{userProfile.role}</span>
            </p>
          </div>

          {/* Stats Cards */}
          {!loadingStats && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {userProfile.role === "employer" ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Active Job Postings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.jobs}</p>
                      <p className="text-sm text-muted-foreground mt-2">Jobs you've posted</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.applications}</p>
                      <p className="text-sm text-muted-foreground mt-2">Received from applicants</p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Applications Submitted</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.applications}</p>
                      <p className="text-sm text-muted-foreground mt-2">Jobs you've applied to</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Available Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">Browse</p>
                      <p className="text-sm text-muted-foreground mt-2">Find your next opportunity</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your next step</CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile.role === "employer" ? (
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/jobs/create">
                    <Button className="w-full">Post a New Job</Button>
                  </Link>
                  <Link href="/employer/jobs">
                    <Button variant="outline" className="w-full bg-transparent">
                      View My Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/jobs">
                    <Button className="w-full">Browse Jobs</Button>
                  </Link>
                  <Link href="/applicant/applications">
                    <Button variant="outline" className="w-full bg-transparent">
                      My Applications
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
