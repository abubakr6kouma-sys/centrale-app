import LandingNav from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooterCta'
import ScrollReveal from '@/components/landing/ScrollReveal'
import Link from 'next/link'
import { SUPPORT_EMAIL } from '@/lib/siteConfig'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Suppression des données — CentralY',
  description: 'Comment supprimer votre compte et vos données personnelles de CentralY.',
}

export default function DataDeletionPage() {
  return (
    <div className="font-sans bg-[#0a0a0a] text-[#f5f3ee] min-h-screen overflow-hidden relative">
      <ScrollReveal />

      <div
        className="absolute -top-[340px] left-1/2 -translate-x-1/2 w-[1100px] h-[760px] blur-[20px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(closest-side, rgba(201,184,150,0.08), rgba(201,184,150,0) 70%)',
        }}
      />

      <LandingNav />

      <main className="relative z-10 max-w-[760px] mx-auto px-10 pt-[60px] pb-[140px] max-md:px-5 max-md:pt-[36px]">
        <div data-reveal className="mb-[56px]">
          <div className="text-[12px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[16px]">
            LÉGAL
          </div>
          <h1 className="font-display font-semibold text-[44px] leading-[1.1] tracking-[-0.03em] text-[#f5f3ee] mb-4 max-md:text-[30px]">
            Suppression des données
          </h1>
          <p className="text-[15px] text-[#6a6862]">
            Dernière mise à jour : 26 juin 2026
          </p>
        </div>

        {/* CTA card */}
        <div
          data-reveal
          className="rounded-2xl border border-[rgba(201,184,150,0.25)] bg-[rgba(201,184,150,0.05)] px-7 py-7 mb-[50px]"
        >
          <p className="text-[15.5px] font-semibold text-[#e7e5de] mb-2">
            Vous souhaitez supprimer votre compte ?
          </p>
          <p className="text-[14px] text-[#9b9890] leading-[1.65] mb-5">
            Envoyez-nous une demande via le formulaire de contact. Toutes vos données seront
            supprimées dans un délai de 30 jours.
          </p>
          <Link
            href="/contact"
            className="inline-block text-[14px] font-semibold text-[#0a0a0a] bg-[#f5f3ee] px-5 py-[10px] rounded-full no-underline"
          >
            Faire une demande de suppression →
          </Link>
        </div>

        <div>
          <Section title="1. Votre droit à l'effacement">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois
              applicables sur la protection de la vie privée, vous avez le droit de demander la
              suppression de votre compte CentralY et de l&apos;ensemble de vos données personnelles
              à tout moment, sans avoir à justifier votre demande.
            </p>
          </Section>

          <Section title="2. Données supprimées">
            <p>
              Lorsque vous demandez la suppression de votre compte, nous supprimons les données
              suivantes :
            </p>
            <ul>
              <li>
                Votre profil utilisateur (adresse email, nom, photo de profil issus de Google).
              </li>
              <li>
                L&apos;ensemble des emails analysés stockés dans notre base de données.
              </li>
              <li>
                Tous les brouillons de réponse générés par l&apos;IA associés à votre compte.
              </li>
              <li>
                Les tokens d&apos;accès Gmail chiffrés liés à votre compte.
              </li>
              <li>
                Vos statistiques d&apos;utilisation et données de quota mensuel.
              </li>
              <li>
                Les informations relatives à votre abonnement (hors données de facturation soumises
                à des obligations légales de conservation).
              </li>
            </ul>
            <p>
              <strong>
                Vos emails ne sont pas copiés ou archivés par CentralY — ils restent dans votre
                boîte Gmail.
              </strong>{' '}
              La suppression de votre compte CentralY n&apos;affecte en aucun cas votre boîte Gmail
              ni vos emails.
            </p>
          </Section>

          <Section title="3. Comment faire une demande">
            <p>
              Pour demander la suppression de votre compte et de vos données, vous avez deux
              options :
            </p>
            <ul>
              <li>
                <strong>Via le formulaire de contact</strong> : rendez-vous sur notre{' '}
                <a href="/contact" className="text-[#c9b896] no-underline">
                  page de contact
                </a>{' '}
                et précisez dans le message : « Suppression de compte — [votre adresse email] ».
              </li>
              <li>
                <strong>Par email</strong> : envoyez votre demande directement à{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#c9b896] no-underline">
                  {SUPPORT_EMAIL}
                </a>{' '}
                en indiquant l&apos;adresse email associée à votre compte CentralY.
              </li>
              <li>
                <strong>Révocation des accès Google</strong> : vous pouvez également révoquer
                l&apos;accès de CentralY à votre compte Google depuis les{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c9b896] no-underline"
                >
                  paramètres de sécurité Google
                </a>
                . Cela empêchera CentralY d&apos;accéder à votre Gmail, mais ne supprime pas vos
                données de notre base. Combinez cette action avec une demande de suppression pour
                une suppression complète.
              </li>
            </ul>
          </Section>

          <Section title="4. Délai de traitement">
            <p>
              Nous traitons les demandes de suppression dans un délai maximum de <strong>30 jours
              calendaires</strong> à compter de la réception de votre demande. Vous recevrez une
              confirmation par email une fois la suppression effectuée.
            </p>
            <p>
              Certaines données de facturation peuvent être conservées au-delà de ce délai pour
              répondre à nos obligations légales (comptabilité, fiscalité), conformément à la
              législation applicable.
            </p>
          </Section>

          <Section title="5. Après la suppression">
            <p>
              Une fois votre compte supprimé :
            </p>
            <ul>
              <li>
                Vous ne pourrez plus vous connecter à CentralY avec cette adresse email.
              </li>
              <li>
                Toutes vos données seront définitivement effacées et ne pourront pas être
                récupérées.
              </li>
              <li>
                Votre boîte Gmail et vos emails ne sont pas affectés.
              </li>
              <li>
                Si vous souhaitez utiliser CentralY à nouveau, vous devrez créer un nouveau compte.
              </li>
            </ul>
          </Section>

          <Section title="6. Questions">
            <p>
              Pour toute question relative à la suppression de vos données ou à vos droits,
              contactez-nous via notre{' '}
              <a href="/contact" className="text-[#c9b896] no-underline">
                formulaire de contact
              </a>
              . Pour plus d&apos;informations sur la façon dont nous traitons vos données,
              consultez notre{' '}
              <a href="/privacy" className="text-[#c9b896] no-underline">
                politique de confidentialité
              </a>
              .
            </p>
          </Section>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div data-reveal className="mb-[42px]">
      <h2 className="font-display font-semibold text-[20px] tracking-[-0.01em] text-[#f5f3ee] mb-[14px]">
        {title}
      </h2>
      <div className="text-[15px] leading-[1.75] text-[#9b9890] flex flex-col gap-[12px] [&_strong]:text-[#c6c4bd] [&_a]:text-[#c9b896] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[8px] [&_ul]:pl-5 [&_li]:list-disc">
        {children}
      </div>
    </div>
  )
}
