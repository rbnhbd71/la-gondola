'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard', exact: true },
  { href: '/dashboard/reservations', label: 'Reservations', exact: false },
  { href: '/dashboard/customers', label: 'Customers', exact: false },
  { href: '/dashboard/settings', label: 'Settings', exact: false },
]

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 p-3">
      {links.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm rounded-md px-3 py-2 transition-colors ${
              active
                ? 'bg-gray-200 text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
