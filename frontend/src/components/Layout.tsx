import { Outlet } from 'react-router-dom'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { AuthProvider } from '@/context/AuthContext'

export function Layout() {
  return (
    <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main className="container mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            <Outlet />
          </main>
          <Footer />
        </div>
    </AuthProvider>
  )
}
