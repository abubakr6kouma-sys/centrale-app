const STEPS = [
  {
    n: '01',
    title: 'Connectez Gmail',
    text: 'Reliez votre boîte en deux minutes. Vos emails restent chez vous, chiffrés.',
  },
  {
    n: '02',
    title: 'L\'IA analyse et prépare',
    text: 'Chaque email est classé, résumé, et une réponse professionnelle est rédigée.',
  },
  {
    n: '03',
    title: 'Vous validez et envoyez',
    text: 'Vous relisez, ajustez si besoin, et envoyez d\'un seul clic. Toujours vous.',
  },
]

export default function LandingHowItWorks() {
  return (
    <section className="relative z-10 max-w-[1080px] mx-auto px-10 mt-[180px]">
      <div data-reveal className="text-center mb-[72px]">
        <div className="text-[12.5px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[18px]">
          COMMENT ÇA MARCHE
        </div>
        <h2 className="font-display font-semibold text-[44px] leading-[1.1] tracking-[-0.03em] text-[#f5f3ee]">
          Trois étapes. Rien de plus.
        </h2>
      </div>
      <div data-reveal className="grid grid-cols-3 gap-12">
        {STEPS.map((s) => (
          <div key={s.n}>
            <div className="font-display text-sm text-[#6a6862] font-semibold tracking-[0.05em] mb-[22px]">
              {s.n}
            </div>
            <h3 className="font-display text-[21px] font-semibold mb-3 tracking-[-0.01em] text-[#f5f3ee]">
              {s.title}
            </h3>
            <p className="text-[15px] text-[#9b9890] leading-[1.65] m-0">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
