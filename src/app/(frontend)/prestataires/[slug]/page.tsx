import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import Breadcrumb from '@/components/Breadcrumb'
import CategoryLabel from '@/components/CategoryLabel'
import Container from '@/components/Container'
import JsonLd from '@/components/JsonLd'
import ProviderContact from '@/components/provider/ProviderContact'
import ProviderLogo from '@/components/provider/ProviderLogo'
import RichText from '@/components/RichText'
import { interventionAreaLabel } from '@/lib/interventionAreas'
import { providerCategoryLabel } from '@/lib/providerCategories'
import { getProviderBySlug, getPublishedProviderSlugs } from '@/lib/queries/providers'
import { providerCategoryPath, providerPath, providersPath } from '@/lib/routes'
import { contentMetadata } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'
import type { Media } from '@/payload-types'
import { rule } from '@/theme/tokens'

/** SSG au build, puis régénération à la demande (le hook de l'admin la déclenche). */
export const revalidate = 3600

export const dynamicParams = true

type Props = {
  params: Promise<{ slug: string }>
}

const asMedia = (value: Media | number | null | undefined): Media | null =>
  value && typeof value === 'object' ? value : null

export async function generateStaticParams() {
  const slugs = await getPublishedProviderSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const provider = await getProviderBySlug(slug)

  if (!provider) return { title: 'Page introuvable' }

  // Une fiche d'annuaire n'est pas un contenu daté : `website` plutôt
  // qu'`article` côté Open Graph.
  return contentMetadata(provider, providerPath(provider), 'website')
}

export default async function ProviderPage({ params }: Props) {
  const { slug } = await params
  const provider = await getProviderBySlug(slug)

  if (!provider) notFound()

  const category = providerCategoryLabel(provider.category)
  const areas = provider.interventionAreas ?? []
  const logo = asMedia(provider.logo)
  const url = absoluteUrl(providerPath(provider))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: provider.name,
    description: provider.shortDescription,
    // `url` désigne le site officiel de l'organisation quand il est connu ; la
    // fiche reste rattachée via `mainEntityOfPage`.
    url: provider.contact?.website || url,
    ...(logo?.url ? { logo: absoluteUrl(logo.url) } : {}),
    ...(provider.contact?.email ? { email: provider.contact.email } : {}),
    ...(provider.contact?.phone ? { telephone: provider.contact.phone } : {}),
    ...(areas.length > 0
      ? { areaServed: areas.map((area) => interventionAreaLabel(area)) }
      : {}),
    knowsAbout: category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  return (
    <Container width="narrow" sx={{ py: { xs: 3, md: 4 } }}>
      <JsonLd data={jsonLd} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Prestataires', href: providersPath },
          { label: provider.name },
        ]}
      />

      <Box component="article" sx={{ mt: { xs: 2.5, md: 3 } }}>
        <Box component="header">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 2, sm: 2.5 },
              mb: 2,
            }}
          >
            <ProviderLogo provider={provider} size={88} />

            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ mb: 1 }}>
                <CategoryLabel
                  name={category}
                  href={providerCategoryPath(provider.category)}
                />
              </Box>

              <Typography
                variant="h1"
                component="h1"
                sx={{ fontSize: 'clamp(1.625rem, 1.25rem + 1.6vw, 2.25rem)', m: 0 }}
              >
                {provider.name}
              </Typography>
            </Box>
          </Box>

          <Typography variant="lede" component="p" sx={{ color: 'text.secondary', mb: 2.5 }}>
            {provider.shortDescription}
          </Typography>

          {areas.length > 0 ? (
            <Box
              component="section"
              aria-labelledby="zones-intervention"
              sx={{ pt: 2, borderTop: `1px solid ${rule}` }}
            >
              <Typography
                id="zones-intervention"
                component="h2"
                variant="overline"
                sx={{ display: 'block', color: 'text.secondary', mb: 1 }}
              >
                Zone d’intervention
              </Typography>

              {/* Vraie liste pour les technologies d'assistance ; la virgule de
                  séparation est décorative, donc portée par le CSS. */}
              <Box
                component="ul"
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  columnGap: 0.5,
                  rowGap: 0.25,
                  listStyle: 'none',
                  m: 0,
                  p: 0,
                  fontSize: '0.9375rem',
                  '& li:not(:last-child)::after': { content: '","' },
                }}
              >
                {areas.map((area) => (
                  <Box component="li" key={area}>
                    {interventionAreaLabel(area)}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}
        </Box>

        {provider.description ? (
          <Box sx={{ mt: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 }, borderTop: `1px solid ${rule}` }}>
            <Typography component="h2" variant="h3" sx={{ fontSize: '1.25rem', mb: 2 }}>
              Présentation
            </Typography>
            <RichText data={provider.description} />
          </Box>
        ) : null}

        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <ProviderContact contact={provider.contact ?? {}} name={provider.name} id="contact" />
        </Box>
      </Box>

      <Box sx={{ mt: { xs: 4, md: 5 }, pt: { xs: 2, md: 2.5 }, borderTop: `1px solid ${rule}` }}>
        <AppLink href={providerCategoryPath(provider.category)} sx={{ fontSize: '0.9375rem' }}>
          {`Voir les autres prestataires de la catégorie « ${category} »`}
        </AppLink>
      </Box>
    </Container>
  )
}
