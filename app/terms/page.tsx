import LandingNav from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooterCta'
import ScrollReveal from '@/components/landing/ScrollReveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions d'utilisation — CentralY",
  description: "Conditions générales d'utilisation du service CentralY.",
}

export default function TermsPage() {
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
            Conditions d&apos;utilisation
          </h1>
          <p className="text-[15px] text-[#6a6862]">
            Dernière mise à jour : 26 juin 2026
          </p>
        </div>

        <div>
          <Section title="1. Acceptation des conditions">
            <p>
              En accédant à CentralY et en créant un compte, vous acceptez pleinement et sans
              réserve les présentes Conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces
              conditions, veuillez ne pas utiliser le service.
            </p>
          </Section>

          <Section title="2. Description du service">
            <p>
              CentralY est un assistant d&apos;emails alimenté par intelligence artificielle. Le
              service se connecte à votre boîte Gmail via l&apos;API Google, analyse vos emails
              entrants, les classe par catégorie, génère des résumés et propose des brouillons de
              réponse professionnels que vous pouvez modifier et envoyer.
            </p>
            <p>
              CentralY ne remplace pas votre jugement. Chaque réponse générée par l&apos;IA doit
              être relue et validée par vous avant envoi. <strong>Aucun email n&apos;est envoyé
              sans votre validation explicite.</strong>
            </p>
          </Section>

          <Section title="3. Conditions d'accès">
            <p>Pour utiliser CentralY, vous devez :</p>
            <ul>
              <li>Disposer d&apos;un compte Google avec une boîte Gmail active.</li>
              <li>
                Autoriser CentralY à accéder à votre Gmail via le consentement OAuth (lecture et
                envoi d&apos;emails uniquement, sur votre demande explicite).
              </li>
              <li>
                Utiliser le service à des fins professionnelles ou personnelles légitimes,
                conformément aux présentes conditions.
              </li>
            </ul>
          </Section>

          <Section title="4. Utilisation autorisée">
            <p>
              Vous vous engagez à utiliser CentralY de manière licite et respectueuse. Sont
              notamment interdits :
            </p>
            <ul>
              <li>L&apos;utilisation du service à des fins frauduleuses ou illégales.</li>
              <li>
                L&apos;envoi en masse d&apos;emails non sollicités (spam) via les brouillons générés.
              </li>
              <li>
                Toute tentative d&apos;accéder à des fonctionnalités ou données non autorisées.
              </li>
              <li>
                La revente, la redistribution ou l&apos;exploitation commerciale du service sans
                autorisation écrite préalable.
              </li>
              <li>
                Toute action susceptible de nuire à l&apos;infrastructure ou à la sécurité de
                CentralY.
              </li>
            </ul>
          </Section>

          <Section title="5. Abonnements et paiements">
            <p>
              CentralY propose un plan gratuit (limité en nombre d&apos;emails analysés par mois)
              et des plans payants offrant des quotas supérieurs. Les tarifs sont disponibles sur
              la{' '}
              <a href="/tarifs" className="text-[#c9b896] no-underline">
                page Tarifs
              </a>
              .
            </p>
            <p>
              Les abonnements payants sont facturés mensuellement ou annuellement selon votre choix.
              Vous pouvez résilier à tout moment depuis vos paramètres de compte. La résiliation
              prend effet à la fin de la période de facturation en cours, sans remboursement
              proratisé.
            </p>
          </Section>

          <Section title="6. Propriété intellectuelle">
            <p>
              L&apos;ensemble du code, du design, des textes et des éléments visuels de CentralY
              sont la propriété exclusive de CentralY AI et sont protégés par les lois sur la
              propriété intellectuelle.
            </p>
            <p>
              Les contenus que vous rédigez, modifiez ou envoyez via CentralY vous appartiennent.
              Les brouillons générés par l&apos;IA sont des suggestions — vous restez l&apos;auteur
              de toute communication envoyée depuis votre compte Gmail.
            </p>
          </Section>

          <Section title="7. Disponibilité du service">
            <p>
              Nous nous efforçons de maintenir CentralY disponible en permanence, mais nous ne
              garantissons pas une disponibilité ininterrompue. Des interruptions peuvent survenir
              pour maintenance, mises à jour ou raisons techniques indépendantes de notre volonté.
            </p>
          </Section>

          <Section title="8. Limitation de responsabilité">
            <p>
              CentralY est fourni « en l&apos;état ». Nous ne sommes pas responsables des
              conséquences découlant de l&apos;envoi d&apos;un email généré ou modifié via notre
              service. Il vous appartient de relire chaque réponse avant de l&apos;envoyer.
            </p>
            <p>
              Dans toute la mesure permise par la loi applicable, notre responsabilité totale envers
              vous ne saurait excéder le montant que vous avez payé pour le service au cours des
              trois derniers mois.
            </p>
          </Section>

          <Section title="9. Résiliation">
            <p>
              Vous pouvez supprimer votre compte à tout moment depuis vos paramètres ou en nous
              contactant via notre{' '}
              <a href="/contact" className="text-[#c9b896] no-underline">
                formulaire de contact
              </a>
              . Nous nous réservons le droit de suspendre ou de résilier votre accès en cas de
              violation des présentes conditions.
            </p>
          </Section>

          <Section title="10. Modifications des conditions">
            <p>
              Nous pouvons modifier ces conditions à tout moment. En cas de changement substantiel,
              nous vous en informerons par email ou via une notification dans l&apos;application, au
              moins 7 jours avant l&apos;entrée en vigueur. La poursuite de l&apos;utilisation du
              service après cette date vaut acceptation des nouvelles conditions.
            </p>
          </Section>

          <Section title="11. Droit applicable">
            <p>
              Les présentes conditions sont régies par le droit français. En cas de litige,
              et à défaut de résolution amiable, les tribunaux compétents seront ceux du ressort
              de notre siège social.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              Pour toute question relative aux présentes conditions, contactez-nous via notre{' '}
              <a href="/contact" className="text-[#c9b896] no-underline">
                formulaire de contact
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
