'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ComponentProps, MouseEvent } from 'react'

interface CurtainLinkProps extends ComponentProps<typeof Link> {
  curtainTransition?: boolean
  curtainReverse?: boolean
}

export default function CurtainLink({
  curtainTransition = false,
  curtainReverse = false,
  href,
  onClick,
  ...props
}: CurtainLinkProps) {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call original onClick if provided
    if (onClick) {
      onClick(e)
    }

    // Only handle curtain transition if enabled and View Transitions API is supported
    if (!curtainTransition || !document.startViewTransition) {
      return // Let default Link behavior handle it
    }

    // Prevent default navigation
    e.preventDefault()

    // Add data attributes to trigger curtain CSS
    document.documentElement.setAttribute('data-curtain-transition', 'true')
    if (curtainReverse) {
      document.documentElement.setAttribute('data-curtain-reverse', 'true')
    }

    // Start view transition
    const transition = document.startViewTransition(() => {
      router.push(href.toString())
    })

    // Clean up data attributes after transition
    transition.finished.finally(() => {
      document.documentElement.removeAttribute('data-curtain-transition')
      document.documentElement.removeAttribute('data-curtain-reverse')
    })
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
