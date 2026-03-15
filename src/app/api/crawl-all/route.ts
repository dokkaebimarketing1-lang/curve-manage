import { crawlAllMissingImages } from '@/lib/actions/influencer'
import { NextResponse } from 'next/server'

export async function POST() {
  const result = await crawlAllMissingImages()
  return NextResponse.json(result)
}
