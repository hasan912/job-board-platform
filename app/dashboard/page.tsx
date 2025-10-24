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
      <nav className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">Job Board</h1>
          <div className="flex gap-3 items-center">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="hover:bg-accent">Profile</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="text-destructive hover:bg-destructive/10">
              Logout
            </Button>
            <ThemeToggle/>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-background blur-3xl -z-10"></div>
            <div className="relative bg-card p-6 rounded-lg border border-border/50 shadow-sm">
              <h2 className="text-2xl font-medium mb-1">Welcome back, {userProfile.name}</h2>
              <p className="text-muted-foreground text-sm">
                Logged in as <span className="font-medium capitalize">{userProfile.role}</span>
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {!loadingStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProfile.role === "employer" ? (
                <>
                  <Card className="group hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium">Active Job Postings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold group-hover:text-primary transition-colors">{stats.jobs}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total jobs posted</p>
                    </CardContent>
                  </Card>
                  <Card className="group hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium">Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold group-hover:text-primary transition-colors">{stats.applications}</p>
                      <p className="text-xs text-muted-foreground mt-1">Applications received</p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="group hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium">Applications Submitted</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold group-hover:text-primary transition-colors">{stats.applications}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total applications</p>
                    </CardContent>
                  </Card>
                  <Card className="group hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium">Available Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold group-hover:text-primary transition-colors">Browse</p>
                      <p className="text-xs text-muted-foreground mt-1">Find new opportunities</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <Card className="overflow-hidden ">
            <CardHeader className="border-b ">
              <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Get started with your next step</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {userProfile.role === "employer" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Link href="/jobs/create" className="w-full">
                    <Button className="w-full bg-primary/90 hover:bg-primary" size="sm">
                      Post a New Job
                    </Button>
                  </Link>
                  <Link href="/employer/jobs" className="w-full">
                    <Button variant="outline" size="sm" className="w-full hover:bg-accent">
                      View My Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Link href="/jobs" className="w-full">
                    <Button className="w-full bg-primary/90 hover:bg-primary" size="sm">
                      Browse Jobs
                    </Button>
                  </Link>
                  <Link href="/applicant/applications" className="w-full">
                    <Button variant="outline" size="sm" className="w-full hover:bg-accent">
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
