'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  index: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function ImageLightbox({
  images,
  index,
  onClose,
  onNext,
  onPrev,
}: Props) {
  const current = images[index]

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, onNext, onPrev])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute left-4 text-white p-2"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 text-white p-2"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Image */}
      <div className="relative w-[90vw] h-[90vh]">
        <Image
          src={current}
          fill
          sizes="90vw"
          className="object-contain"
          alt=""
        />
      </div>
    </div>
  )
}