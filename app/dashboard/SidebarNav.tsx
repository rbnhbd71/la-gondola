'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { dictionary, type Locale } from '@/lib/i18n/dictionary'

export default function SidebarNav({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const dict = dictionary[locale]

  const links = [
    { href: '/dashboard', label: dict.nav.dashboard, exact: true },
    { href: '/dashboard/reservations', label: dict.nav.reservations, exact: false },
    { href: '/dashboard/floor-plan', label: dict.nav.floorPlan, exact: false },
    { href: '/dashboard/customers', label: dict.nav.customers, exact: false },
    { href: '/dashboard/campaigns', label: dict.nav.campaigns, exact: false },
    { href: '/dashboard/settings', label: dict.nav.settings, exact: false },
  ]

  return (
    <nav className="flex flex-col py-3">
      {links.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm py-2 px-4 mx-2 rounded-md transition-colors ${
              active
                ? 'bg-clay-tint text-clay-dark font-medium'
                : 'text-ink-faint hover:text-ink hover:bg-surface-sunk'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
