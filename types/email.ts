export type Category = 'Prospect' | 'Client' | 'Support' | 'Facture' | 'Urgent' | 'Autre'

export interface CategoryStyle {
  text: string
  bg: string
  dot: string
  /** Libellé au pluriel utilisé dans la sidebar et les badges du nouveau design. */
  label: string
  /** Clé interne utilisée par le nouveau design pour les filtres (data-cat). */
  filterKey: string
}

// Couleurs et libellés repris à l'identique du nouveau design validé
// (CentralY Dashboard.dc.html). La valeur stockée en base (Category) ne change
// pas : seul l'habillage visuel (couleur, libellé pluriel) est mis à jour.
export const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  Prospect: { text: '#8a6648', bg: '#efe6db', dot: '#b08968', label: 'Prospects', filterKey: 'prospects' },
  Client: { text: '#5f6b4f', bg: '#eaece2', dot: '#7d8471', label: 'Clients', filterKey: 'clients' },
  Support: { text: '#6b6450', bg: '#f0ece1', dot: '#8a8170', label: 'Support', filterKey: 'support' },
  Facture: { text: '#8a7355', bg: '#f1ece1', dot: '#9a8c7a', label: 'Factures', filterKey: 'factures' },
  Urgent: { text: '#9a3f3c', bg: '#f4e3e2', dot: '#b5524f', label: 'Urgents', filterKey: 'urgents' },
  Autre: { text: '#7a766c', bg: '#ecebe5', dot: '#a8a499', label: 'Autres', filterKey: 'autres' },
}

// Ordre d'affichage dans la sidebar, identique au nouveau design (Autre ajouté
// à la fin puisqu'il n'existait pas dans la maquette mais reste une vraie
// valeur de la base de données).
export const CATEGORY_ORDER: Category[] = ['Prospect', 'Client', 'Support', 'Facture', 'Urgent', 'Autre']

export type EmailStatus = 'new' | 'draft_ready' | 'replied' | 'archived'

export interface EmailRecord {
  id: string
  gmail_message_id: string
  gmail_thread_id: string | null
  sender_email: string
  sender_name: string | null
  subject: string | null
  body_preview: string | null
  body_full: string | null
  received_at: string
  category: Category | null
  priority: string | null
  summary: string | null
  status: EmailStatus
  created_at: string
}

export interface DraftRecord {
  id: string
  email_id: string
  ai_generated_content: string
  final_content: string | null
  sent_at: string | null
  created_at: string
}

export interface EmailWithDraft extends EmailRecord {
  draft: DraftRecord | null
}

export function initialsFromName(name: string | null, fallbackEmail: string): string {
  const source = name && name.trim().length > 0 ? name : fallbackEmail
  const parts = source.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function avatarColorFromString(input: string): string {
  const palette = ['#2a2a26', '#7d8471', '#a85a52', '#8a6648', '#9a8c7a', '#5f6b4f']
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return palette[Math.abs(hash) % palette.length]
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'maintenant'
  if (diffMin < 60) return `${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'hier'
  if (diffD < 7) return `${diffD} j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
