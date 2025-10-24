"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import Footer from './footer'

export default function FooterClient() {
  const pathname = usePathname()

  // don't show footer on any auth routes (login / signup / other auth pages)
  if (pathname && pathname.startsWith('/auth')) return null

  return <Footer />
}
