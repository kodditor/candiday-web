import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner';

export function Root() {
  return (
    <div className="min-h-screen bg-background">
      <main className="">
        <Outlet />
      </main>
      <Toaster position='top-right' />
    </div>
  )
}
