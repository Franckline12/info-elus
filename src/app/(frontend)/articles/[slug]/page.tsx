import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import ArticleDetail from '@/components/article/ArticleDetail'
import { getArticleBySlug, getPublishedSlugs, getRelatedArticles } from '@/lib/queries/articles'
import { articleMetadata } from '@/lib/seo'
import { articlePath } from '@/lib/routes'

/** SSG au build, puis régénération à la demande (le hook de l'admin la déclenche). */
export const revalidate = 3600

/** Un slug publié après le build est rendu à la première visite, puis mis en cache. */
export const dynamicParams = true

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs('article')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug, 'article')

  if (!article) return { title: 'Page introuvable' }

  return articleMetadata(article, articlePath(article))
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params

  // Le filtre de type est dans la requête : une actualité demandée ici renvoie
  // `null`, donc une 404.
  const article = await getArticleBySlug(slug, 'article')

  if (!article) notFound()

  const related = await getRelatedArticles(article, 3)

  return <ArticleDetail article={article} related={related} />
}
