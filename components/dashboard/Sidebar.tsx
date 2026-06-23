'use client'

import SidebarFrame from '@/components/dashboard/SidebarFrame'
import { Category, CATEGORY_ORDER, CATEGORY_STYLES } from '@/types/email'

interface SidebarProps {
  userName: string
  userEmail: string
  counts: Record<string, number>
  totalCount: number
  activeFilter: string | null
  onFilterChange: (filter: string | null) => void
}

// Sidebar du dashboard : coquille commune (SidebarFrame) + filtres par
// catégorie, fidèle au nouveau design validé (CentralY Dashboard.dc.html).
export default function Sidebar({
  userName,
  userEmail,
  counts,
  totalCount,
  activeFilter,
  onFilterChange,
}: SidebarProps) {
  return (
    <SidebarFrame userName={userName} userEmail={userEmail}>
      <button className="border-none cursor-pointer w-full flex items-center justify-center gap-[9px] px-3 py-[9px] rounded-[9px] bg-ink text-white font-semibold text-[13.5px] mb-5 max-lg:hidden">
        <span className="text-[15px]">✦</span> Nouveau message
      </button>

      <div className="text-[11px] font-semibold text-faint tracking-[0.06em] px-[10px] pb-[9px] max-lg:hidden">
        FILTRES
      </div>

      <nav
        className="
          flex flex-col gap-[3px]
          max-lg:flex-row max-lg:gap-2 max-lg:flex-1 max-lg:overflow-x-auto max-lg:pb-0.5
          max-lg:[-webkit-overflow-scrolling:touch] max-lg:[scrollbar-width:none]
        "
      >
        <FilterPill
          active={activeFilter === 'all' || activeFilter === null}
          onClick={() => onFilterChange('all')}
          dotColor="#1a1a18"
          label="Tous les emails"
          count={totalCount}
        />
        {CATEGORY_ORDER.map((cat) => (
          <FilterPill
            key={cat}
            active={activeFilter === cat}
            onClick={() => onFilterChange(cat)}
            dotColor={CATEGORY_STYLES[cat].dot}
            label={CATEGORY_STYLES[cat].label}
            count={counts[cat] || 0}
          />
        ))}
      </nav>
    </SidebarFrame>
  )
}

function FilterPill({
  active,
  onClick,
  dotColor,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  dotColor: string
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={`
        cursor-pointer flex items-center gap-[10px] px-[11px] py-2 rounded-lg text-[13.5px] whitespace-nowrap border border-transparent text-left
        max-lg:rounded-full max-lg:border max-lg:px-[14px] max-lg:py-2 max-lg:flex-none max-lg:bg-cream max-lg:border-line
        ${active ? 'bg-[#e7e3d9] text-[#2a2a26] font-semibold max-lg:bg-ink max-lg:text-cream max-lg:border-ink' : 'text-muted hover:bg-[#ebe7dd] max-lg:hover:bg-[#f0ece1]'}
      `}
    >
      <span className="w-2 h-2 rounded-[2px] flex-none" style={{ background: dotColor }} />
      {label}
      <span
        className={`ml-auto text-[11.5px] flex-none ${active ? 'text-[#7a6f57] max-lg:text-[#c9b896]' : 'text-faint'}`}
      >
        {count}
      </span>
    </button>
  )
}
