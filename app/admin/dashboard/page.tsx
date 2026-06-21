// app/admin/dashboard/page.tsx
// Redirects /admin/dashboard -> /admin (the actual dashboard page)
import { redirect } from 'next/navigation'

export default function AdminDashboardRedirect() {
  redirect('/admin')
}
