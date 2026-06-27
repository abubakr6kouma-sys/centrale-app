import LandingNav from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooterCta'
import ScrollReveal from '@/components/landing/ScrollReveal'
import { SUPPORT_EMAIL } from '@/lib/siteConfig'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — CentralY',
  description: 'Comment CentralY collecte, utilise et protège vos données personnelles.',
}

export default function PrivacyPage() {
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
            Politique de confidentialité
          </h1>
          <p className="text-[15px] text-[#6a6862]">
            Dernière mise à jour : 26 juin 2026
          </p>
        </div>

        <div className="prose-legal">
          <Section title="1. Qui sommes-nous">
            <p>
              CentralY AI (« CentralY », « nous », « notre ») est un assistant d&apos;emails
              alimenté par intelligence artificielle, accessible à l&apos;adresse{' '}
              <a href="https://centrale-app.vercel.app" className="text-[#c9b896] no-underline">
                centrale-app.vercel.app
              </a>
              . Le service aide les professionnels à lire, classer et répondre à leurs emails Gmail
              plus rapidement.
            </p>
            <p>
              Pour toute question relative à cette politique, vous pouvez nous contacter via notre{' '}
              <a href="/contact" className="text-[#c9b896] no-underline">
                formulaire de contact
              </a>
              .
            </p>
          </Section>

          <Section title="2. Données collectées">
            <p>
              Lors de l&apos;utilisation de CentralY, nous collectons les données suivantes :
            </p>
            <ul>
              <li>
                <strong>Informations de compte Google</strong> : adresse email, nom d&apos;affichage
                et photo de profil, transmis via Google OAuth lors de la connexion.
              </li>
              <li>
                <strong>Contenu des emails</strong> : expéditeur, objet, corps du message — récupérés
                via l&apos;API Gmail (lecture seule) pour générer des résumés et des brouillons de
                réponse.
              </li>
              <li>
                <strong>Brouillons générés</strong> : les réponses produites par l&apos;IA et
                éventuellement modifiées par vous, stockées jusqu&apos;à leur envoi ou suppression.
              </li>
              <li>
                <strong>Données d&apos;utilisation</strong> : nombre d&apos;emails analysés et de
                brouillons générés dans le mois, pour la gestion des quotas selon votre abonnement.
              </li>
            </ul>
            <p>
              Nous ne collectons pas vos emails en intégralité sur le long terme : le contenu est
              traité ponctuellement pour générer une analyse et un brouillon, puis conservé
              uniquement dans notre base de données pour vous permettre de le retrouver dans votre
              tableau de bord.
            </p>
          </Section>

          <Section title="3. Finalités du traitement">
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul>
              <li>Vous authentifier via votre compte Google.</li>
              <li>
                Analyser vos emails (classification, résumé, génération d&apos;une réponse par IA)
                afin de vous faire gagner du temps.
              </li>
              <li>
                Gérer votre abonnement et vos quotas mensuels (plan gratuit ou Pro).
              </li>
              <li>
                Améliorer la qualité du service, sur la base de données agrégées et anonymisées.
              </li>
            </ul>
            <p>
              Nous n&apos;utilisons pas vos emails à des fins publicitaires, nous ne les revendons
              pas, et nous ne les partageons pas avec des tiers à des fins commerciales.
            </p>
          </Section>

          <Section title="4. Partage des données">
            <p>
              Vos données personnelles ne sont pas vendues, louées ou cédées à des tiers. Elles
              peuvent être partagées uniquement dans les cas suivants :
            </p>
            <ul>
              <li>
                <strong>Anthropic (Claude API)</strong> : le contenu de vos emails est transmis à
                l&apos;API d&apos;Anthropic pour générer des résumés et des brouillons. Anthropic
                traite ces données en tant que sous-traitant, conformément à sa politique de
                confidentialité.
              </li>
              <li>
                <strong>Supabase</strong> : notre base de données hébergée, utilisée pour stocker
                les emails analysés, les brouillons et les informations de compte.
              </li>
              <li>
                <strong>Google (Gmail API)</strong> : nous accédons à vos emails via les API
                officielles de Google, avec votre autorisation explicite (OAuth).
              </li>
              <li>
                <strong>Obligations légales</strong> : si une loi applicable l&apos;exige, nous
                pouvons être amenés à divulguer certaines données aux autorités compétentes.
              </li>
            </ul>
          </Section>

          <Section title="5. Sécurité des données">
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
              protéger vos données :
            </p>
            <ul>
              <li>
                Les communications entre votre navigateur et nos serveurs sont chiffrées en HTTPS.
              </li>
              <li>
                Les tokens d&apos;accès Gmail sont chiffrés avant d&apos;être stockés en base de
                données.
              </li>
              <li>
                L&apos;accès à notre infrastructure est restreint au personnel autorisé.
              </li>
              <li>
                Nous utilisons Supabase, dont les infrastructures sont hébergées sur des serveurs
                sécurisés conformes aux standards de l&apos;industrie.
              </li>
            </ul>
            <p>
              Aucun système n&apos;est infaillible. En cas de violation de données pouvant vous
              porter préjudice, nous vous en informerons dans les meilleurs délais.
            </p>
          </Section>

          <Section title="6. Conservation des données">
            <p>
              Vos données sont conservées aussi longtemps que votre compte CentralY est actif. Si
              vous supprimez votre compte, toutes vos données (emails analysés, brouillons, tokens
              d&apos;accès) sont supprimées dans un délai de 30 jours.
            </p>
            <p>
              Les données de paiement (si applicable) peuvent être conservées plus longtemps pour
              respecter nos obligations légales et comptables.
            </p>
          </Section>

          <Section title="7. Vos droits">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois
              applicables, vous disposez des droits suivants :
            </p>
            <ul>
              <li>
                <strong>Droit d&apos;accès</strong> : obtenir une copie de vos données personnelles.
              </li>
              <li>
                <strong>Droit de rectification</strong> : corriger des données inexactes.
              </li>
              <li>
                <strong>Droit à l&apos;effacement</strong> : demander la suppression de votre compte
                et de vos données via notre{' '}
                <a href="/data-deletion" className="text-[#c9b896] no-underline">
                  page de suppression
                </a>
                .
              </li>
              <li>
                <strong>Droit à la portabilité</strong> : recevoir vos données dans un format
                structuré.
              </li>
              <li>
                <strong>Droit d&apos;opposition</strong> : vous opposer à certains traitements.
              </li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous via notre{' '}
              <a href="/contact" className="text-[#c9b896] no-underline">
                formulaire de contact
              </a>
              {' '}ou par email à{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#c9b896] no-underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              CentralY utilise uniquement un cookie de session sécurisé (HttpOnly, SameSite=Lax)
              pour maintenir votre connexion. Nous n&apos;utilisons pas de cookies publicitaires ni
              de traceurs tiers.
            </p>
          </Section>

          <Section title="9. Modifications de cette politique">
            <p>
              Nous pouvons mettre à jour cette politique de confidentialité. Toute modification
              substantielle vous sera notifiée par email ou via une bannière dans l&apos;application.
              La date de dernière mise à jour est indiquée en haut de cette page.
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
