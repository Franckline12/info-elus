import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import GuideDetail from '@/components/guide/GuideDetail'
import { getGuideBySlug, getPublishedGuideSlugs, getRelatedGuides } from '@/lib/queries/guides'
import { guidePath } from '@/lib/routes'
import { contentMetadata } from '@/lib/seo'

/** SSG au build, puis régénération à la demande (le hook de l'admin la déclenche). */
export const revalidate = 3600

export const dynamicParams = true

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedGuideSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)

  if (!guide) return { title: 'Page introuvable' }

  return contentMetadata(guide, guidePath(guide))
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)

  if (!guide) notFound()

  const related = await getRelatedGuides(guide, 3)

  return <GuideDetail guide={guide} related={related} />
}
