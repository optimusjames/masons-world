'use client'

import { useState, useEffect } from 'react'

const SHELL_PATH = 'M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44'

function shellSvgDataUrl(dark: boolean) {
  const bg = dark ? '#1a1816' : '#f5f2ed'
  const stroke = dark ? '#f0ede8' : '#1a1816'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60"><rect width="24" height="24" fill="${bg}"/><path d="${SHELL_PATH}" stroke="${stroke}" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default function QrCode({
  url,
  dark = true,
  size = 120,
}: {
  url: string
  dark?: boolean
  size?: number
}) {
  const [src, setSrc] = useState<string>('')

  useEffect(() => {
    if (!url) return
    setSrc('')

    import('qr-code-styling').then(async ({ default: QRCodeStyling }) => {
      const qr = new QRCodeStyling({
        width: size * 2,
        height: size * 2,
        data: url,
        image: shellSvgDataUrl(dark),
        dotsOptions: {
          color: dark ? '#f0ede8' : '#1a1816',
          type: 'rounded',
        },
        backgroundOptions: {
          color: dark ? '#1a1816' : '#f5f2ed',
        },
        imageOptions: {
          margin: 6,
          imageSize: 0.28,
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: dark ? '#f0ede8' : '#1a1816',
        },
        cornersDotOptions: {
          color: dark ? '#f0ede8' : '#1a1816',
        },
        qrOptions: {
          errorCorrectionLevel: 'H',
        },
      })

      try {
        const raw = await qr.getRawData('png')
        const blob = raw instanceof Blob ? raw : new Blob([raw as unknown as ArrayBuffer], { type: 'image/png' })
        if (blob) {
          const reader = new FileReader()
          reader.onloadend = () => setSrc(reader.result as string)
          reader.readAsDataURL(blob)
        }
      } catch {
        // fallback: append to temp element and extract canvas
        const tmp = document.createElement('div')
        document.body.appendChild(tmp)
        qr.append(tmp)
        const canvas = tmp.querySelector('canvas')
        if (canvas) setSrc(canvas.toDataURL('image/png'))
        document.body.removeChild(tmp)
      }
    })
  }, [url, dark, size])

  const placeholder = (
    <div
      style={{
        width: size,
        height: size,
        background: dark ? '#1a1816' : '#f5f2ed',
        borderRadius: 4,
      }}
    />
  )

  if (!src) return placeholder

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="QR code"
      style={{ display: 'block', borderRadius: 4 }}
    />
  )
}
