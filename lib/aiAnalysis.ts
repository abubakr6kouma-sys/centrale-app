import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface EmailAnalysis {
  category: 'Prospect' | 'Client' | 'Support' | 'Facture' | 'Urgent' | 'Autre'
  priority: 'haute' | 'normale' | 'basse'
  summary: string
  draft: string
}

const VALID_CATEGORIES = ['Prospect', 'Client', 'Support', 'Facture', 'Urgent', 'Autre']
const VALID_PRIORITIES = ['haute', 'normale', 'basse']

const SYSTEM_PROMPT = `Tu es l'assistant d'analyse d'emails de CentralY, un outil destiné aux entreprises, agences et commerçants francophones.

Pour chaque email reçu, tu dois :
1. Le classer dans EXACTEMENT une de ces catégories : Prospect, Client, Support, Facture, Urgent, Autre.
   - Urgent prime sur les autres si l'email exprime une urgence réelle (délai serré, problème bloquant, mécontentement fort), quel que soit le sujet par ailleurs.
   - Prospect : un contact qui n'est pas encore client, intérêt commercial.
   - Client : un client existant qui écrit pour une demande courante (commande, question, suivi).
   - Support : un problème technique ou une assistance demandée.
   - Facture : tout ce qui concerne la facturation, les paiements, les devis administratifs.
   - Autre : tout le reste (newsletters, notifications automatiques, spam probable, etc.)
2. Évaluer une priorité : haute, normale ou basse.
3. Rédiger un résumé en une à deux phrases, factuel, en français, qui permet de comprendre l'email sans le lire.
4. Rédiger un brouillon de réponse professionnel en français, adapté au contexte, ton courtois et direct, prêt à être relu et envoyé tel quel ou après modification. Le brouillon doit être signé de façon neutre (ne pas inventer de nom si l'expéditeur de la réponse n'est pas connu — termine simplement par une formule de politesse sans nom).

Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises markdown, au format exact :
{"category": "...", "priority": "...", "summary": "...", "draft": "..."}`

export async function analyzeEmail(params: {
  subject: string | null
  senderName: string | null
  senderEmail: string
  bodyText: string
}): Promise<EmailAnalysis> {
  const userContent = [
    `Expéditeur : ${params.senderName || params.senderEmail} <${params.senderEmail}>`,
    `Sujet : ${params.subject || '(sans objet)'}`,
    '',
    'Corps du message :',
    params.bodyText.slice(0, 4000),
  ].join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Réponse IA vide ou inattendue.')
  }

  return parseAnalysisResponse(textBlock.text)
}

function parseAnalysisResponse(raw: string): EmailAnalysis {
  // Filet de sécurité : si le modèle entoure malgré tout le JSON de
  // ```json ... ``` ou de texte, on extrait le premier bloc accolades.
  const match = raw.match(/\{[\s\S]*\}/)
  const jsonText = match ? match[0] : raw

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    // Échec de parsing : on retombe sur une analyse neutre plutôt que de
    // faire planter toute la synchronisation pour un seul email.
    return {
      category: 'Autre',
      priority: 'normale',
      summary: 'Résumé indisponible (réponse IA non interprétable).',
      draft: '',
    }
  }

  const category = VALID_CATEGORIES.includes(parsed.category as string)
    ? (parsed.category as EmailAnalysis['category'])
    : 'Autre'
  const priority = VALID_PRIORITIES.includes(parsed.priority as string)
    ? (parsed.priority as EmailAnalysis['priority'])
    : 'normale'

  return {
    category,
    priority,
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    draft: typeof parsed.draft === 'string' ? parsed.draft : '',
  }
}
