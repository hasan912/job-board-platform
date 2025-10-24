"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { db, auth } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { updatePassword } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface UserProfile {
  uid: string
  email: string
  name: string
  role: "employer" | "applicant"
  bio?: string
  phone?: string
  website?: string
  company?: string
  createdAt: string
}

export default function Profile() {
  const { user, userProfile, loading, logout } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    website: "",
    company: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && userProfile) {
      setProfile(userProfile as UserProfile)
      setFormData({
        name: userProfile.name || "",
        bio: (userProfile as any).bio || "",
        phone: (userProfile as any).phone || "",
        website: (userProfile as any).website || "",
        company: (userProfile as any).company || "",
      })
    }
  }, [user, userProfile, loading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      if (!user) return

      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        website: formData.website,
        company: formData.company,
      })

      setSuccess("Profile updated successfully!")
      setIsEditing(false)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setSaving(true)

    try {
      if (!auth.currentUser) return

      await updatePassword(auth.currentUser, passwordData.newPassword)
      setSuccess("Password changed successfully!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setShowPasswordForm(false)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  // compute simple initials for avatar
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U"

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-xl font-semibold tracking-tight">Job Board</h1>
          </Link>
          <div className="flex gap-3 items-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-accent">Dashboard</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="text-destructive hover:bg-destructive/10">Logout</Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-3">
          <aside className="md:col-span-1">
            <Card className="text-center">
              <CardContent className="space-y-4">
                <div className="mx-auto w-28 h-28 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-foreground">
                  {initials}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
                </div>
                <div className="space-y-2 pt-2">
                  {profile.role === "employer" ? (
                    <Link href="/jobs/create">
                      <Button variant="outline" className="w-full">Post New Job</Button>
                    </Link>
                  ) : (
                    <Link href="/jobs">
                      <Button variant="outline" className="w-full">Browse Jobs</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
            {error && (
              <Card className="mt-4 border-destructive bg-destructive/5">
                <CardContent>
                  <p className="text-destructive text-sm">{error}</p>
                </CardContent>
              </Card>
            )}
            {success && (
              <Card className="mt-4 border-green-600 bg-green-50">
                <CardContent>
                  <p className="text-green-600 text-sm">{success}</p>
                </CardContent>
              </Card>
            )}
          </aside>

          <section className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader className="flex items-start justify-between">
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{profile.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {(profile as any).bio && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bio</p>
                          <p className="font-medium">{(profile as any).bio}</p>
                        </div>
                      )}
                      {(profile as any).phone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{(profile as any).phone}</p>
                        </div>
                      )}
                      {(profile as any).website && (
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <a href={(profile as any).website} target="_blank" rel="noopener noreferrer">
                            <p className="font-medium text-primary hover:underline">{(profile as any).website}</p>
                          </a>
                        </div>
                      )}
                      {(profile as any).company && (
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="font-medium">{(profile as any).company}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          placeholder="https://example.com"
                        />
                      </div>
                      {profile.role === "employer" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Company</label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            placeholder="Your company name"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                      <Button variant="outline" onClick={() => { setIsEditing(false); setFormData({ name: profile.name || '', bio: (profile as any).bio || '', phone: (profile as any).phone || '', website: (profile as any).website || '', company: (profile as any).company || '' }); }}>Cancel</Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>{showPasswordForm ? "Cancel" : "Change Password"}</Button>
              </CardHeader>
              <CardContent>
                {!showPasswordForm ? (
                  <div>
                    <p className="text-sm text-muted-foreground">Last password change: Not available in this version</p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        placeholder="Enter new password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={saving}>{saving ? "Updating..." : "Update Password"}</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
