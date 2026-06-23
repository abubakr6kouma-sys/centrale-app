'use client'

import { useEffect } from 'react'

export default function ScrollReveal() {
  useEffect(() => {
    const reveal = (el: Element) => {
      const node = el as HTMLElement
      node.style.transition =
        'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)'
      node.style.opacity = '1'
      node.style.transform = 'translateY(0)'
    }

    const timeout = setTimeout(() => {
      const els = Array.from(document.querySelectorAll('[data-reveal]'))
      els.forEach((el) => {
        const node = el as HTMLElement
        node.style.opacity = '0'
        node.style.transform = 'translateY(26px)'
      })

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                reveal(entry.target)
                io.unobserve(entry.target)
              }
            })
          },
          { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
        )
        els.forEach((el) => io.observe(el))
        setTimeout(() => els.forEach(reveal), 2400)
      } else {
        els.forEach(reveal)
      }
    }, 30)

    return () => clearTimeout(timeout)
  }, [])

  return null
}
