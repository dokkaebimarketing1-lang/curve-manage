'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ImagePlus, Loader2 } from 'lucide-react'

interface ImageCellProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  onUpload?: (base64: string, fileName: string) => Promise<void>
}

export function ImageCell({ src, alt, width = 60, height = 60, className, onUpload }: ImageCellProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onUpload) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        await onUpload(base64, file.name)
        setError(false)
      }
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // 빈 상태: 업로드 가능하면 업로드 버튼, 아니면 null
  if (!src || error) {
    if (!onUpload) return null

    return (
      <>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFileChange(e)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex items-center justify-center rounded-lg border border-dashed border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer',
            className
          )}
          style={{ width, height }}
          aria-label={`${alt} 업로드`}
        >
          {uploading ? (
            <Loader2 size={16} className="text-zinc-400 animate-spin" />
          ) : (
            <ImagePlus size={16} className="text-zinc-300" />
          )}
        </button>
      </>
    )
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />
      <button
        className={cn(
          'relative overflow-hidden rounded-lg border border-border transition-all duration-200 hover:border-border/80 cursor-pointer group',
          className
        )}
        style={{ width, height }}
        onClick={() => onUpload ? fileRef.current?.click() : undefined}
        type="button"
        aria-label={alt}
      >
        {(loading || uploading) && (
          <div className="absolute inset-0 bg-secondary animate-pulse" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          onLoad={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false) }}
        />
      </button>
    </>
  )
}
