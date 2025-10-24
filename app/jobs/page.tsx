"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
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
  description: string
  employerId: string
  employerName: string
  createdAt: any
}

interface Filters {
  searchTerm: string
  location: string
  jobType: string
  salaryMin: string
  salaryMax: string
}

export default function JobListings() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    searchTerm: "",
    location: "",
    jobType: "",
    salaryMin: "",
    salaryMax: "",
  })
  const [locations, setLocations] = useState<string[]>([])
  const [jobTypes, setJobTypes] = useState<string[]>([])
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      fetchJobs()
    }
  }, [user, loading, router])

  useEffect(() => {
    applyFilters()
  }, [filters, jobs])

  const fetchJobs = async () => {
    try {
      const snapshot = await getDocs(collection(db, "jobs"))
      const jobsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[]
      const sorted = jobsList.sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.() || 0)
      setJobs(sorted)

      // Extract unique locations and job types
      const uniqueLocations = [...new Set(sorted.map((j) => j.location))].sort()
      const uniqueJobTypes = [...new Set(sorted.map((j) => j.jobType))].sort()
      setLocations(uniqueLocations as string[])
      setJobTypes(uniqueJobTypes as string[])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoadingJobs(false)
    }
  }

  const applyFilters = () => {
    let filtered = jobs

    // Search term filter (title, company, description)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term),
      )
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter((job) => job.location === filters.location)
    }

    // Job type filter
    if (filters.jobType) {
      filtered = filtered.filter((job) => job.jobType === filters.jobType)
    }

    // Salary range filter
    if (filters.salaryMin || filters.salaryMax) {
      filtered = filtered.filter((job) => {
        if (!job.salary) return true

        const salaryText = job.salary.toLowerCase()
        const minMatch = salaryText.match(/\$?([\d,]+)/)
        if (!minMatch) return true

        const jobMinSalary = Number.parseInt(minMatch[1].replace(/,/g, ""))

        if (filters.salaryMin && jobMinSalary < Number.parseInt(filters.salaryMin)) {
          return false
        }

        if (filters.salaryMax && jobMinSalary > Number.parseInt(filters.salaryMax)) {
          return false
        }

        return true
      })
    }

    setFilteredJobs(filtered)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      location: "",
      jobType: "",
      salaryMin: "",
      salaryMax: "",
    })
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
          <div className="flex gap-4">
            <Link href="/applicant/applications">
              <Button variant="ghost" className="hover:bg-accent">My Applications</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="hover:bg-accent">Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Available Jobs</h1>

        {/* Mobile: toggle filters */}
        <div className="mb-4 md:hidden flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing {filteredJobs.length} of {jobs.length} jobs</p>
          <Button variant="outline" size="sm" onClick={() => setShowFiltersMobile((s) => !s)}>
            {showFiltersMobile ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFiltersMobile ? "block" : "hidden"} md:block md:col-span-1`}>
            <Card className="md:sticky md:top-4">
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2">Search</label>
                  <input
                    type="text"
                    name="searchTerm"
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    placeholder="Job title, company..."
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Job Type</label>
                  <select
                    name="jobType"
                    value={filters.jobType}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="">All Types</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Salary Range</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      name="salaryMin"
                      value={filters.salaryMin}
                      onChange={handleFilterChange}
                      placeholder="Min ($)"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    />
                    <input
                      type="number"
                      name="salaryMax"
                      value={filters.salaryMax}
                      onChange={handleFilterChange}
                      placeholder="Max ($)"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    />
                  </div>
                </div>

                <Button onClick={resetFilters} variant="outline" className="w-full bg-transparent">
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="col-span-1 md:col-span-3">
            <div className="mb-4 hidden md:flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </p>
            </div>

            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">No jobs match your filters</p>
                  <Button onClick={resetFilters} variant="outline">
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription>{job.company}</CardDescription>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize bg-secondary px-3 py-1 rounded-full">
                          {job.jobType}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{job.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Salary</p>
                          <p className="font-medium">{job.salary || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Posted by</p>
                          <p className="font-medium">{job.employerName}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
                      <Link href={`/jobs/${job.id}`}>
                        <Button>View & Apply</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
