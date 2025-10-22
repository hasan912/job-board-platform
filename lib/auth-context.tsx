"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "./firebase"
import { doc, getDoc } from "firebase/firestore"

interface UserProfile {
  uid: string
  email: string
  role: "employer" | "applicant"
  name: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          let retries = 3
          let userDoc = null

          while (retries > 0) {
            try {
              userDoc = await getDoc(doc(db, "users", currentUser.uid))
              break
            } catch (error: any) {
              retries--
              if (retries > 0) {
                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, 1000 * (4 - retries)))
              } else {
                throw error
              }
            }
          }

          if (userDoc?.exists()) {
            setUserProfile(userDoc.data() as UserProfile)
          } else {
            console.warn("[v0] User profile not found in Firestore")
            setUserProfile({
              uid: currentUser.uid,
              email: currentUser.email || "",
              role: "applicant",
              name: currentUser.displayName || "User",
              createdAt: new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error("[v0] Error fetching user profile:", error)
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || "",
            role: "applicant",
            name: currentUser.displayName || "User",
            createdAt: new Date().toISOString(),
          })
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setUserProfile(null)
  }

  return <AuthContext.Provider value={{ user, userProfile, loading, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
