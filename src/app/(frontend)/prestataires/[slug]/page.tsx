import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'

import AppLink from '@/components/AppLink'
import Breadcrumb from '@/components/Breadcrumb'
import Container from '@/components/Container'
import MediaImage from '@/components/MediaImage'
import { providerCategoryLabel } from '@/lib/providerCategories'
import { getProviderBySlug, getPublishedProviderSlugs } from '@/lib/queries/providers'
import { providerCategoryPath, providersPath } from '@/lib/routes'
import { surfaceBorder } from '@/theme/tokens'

export const revalidate = 3600
export const dynamicParams = true

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedProviderSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const provider = await getProviderBySlug(slug)

  if (!provider) return { title: 'Page introuvable' }

  return { title: provider.name, description: provider.description }
}

export default async function ProviderPage({ params }: Props) {
  const { slug } = await params
  const provider = await getProviderBySlug(slug)

  if (!provider) notFound()

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Prestataires', href: providersPath },
          { label: provider.name },
        ]}
      />

      <Card component="article" sx={{ mt: { xs: 2.5, md: 3 } }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' },
              gap: { xs: 2, sm: 3 },
              alignItems: 'start',
            }}
          >
            {provider.logo ? (
              <Box sx={{ border: `1px solid ${surfaceBorder}`, backgroundColor: '#FFFFFF' }}>
                <MediaImage media={provider.logo} sizes="120px" ratio={4 / 3} />
              </Box>
            ) : null}

            <Box>
              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1.5 }}
              >
                <AppLink
                  href={providerCategoryPath(provider.category)}
                  underline="none"
                  sx={{ display: 'inline-flex' }}
                >
                  <Chip label={providerCategoryLabel(provider.category)} size="small" />
                </AppLink>
              </Box>

              <Typography
                variant="h1"
                component="h1"
                sx={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.2vw, 2.125rem)', mb: 2 }}
              >
                {provider.name}
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                {provider.description}
              </Typography>

              {provider.area ? (
                <Typography
                  component="p"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    m: 0,
                    mb: 3,
                  }}
                >
                  <PlaceOutlinedIcon aria-hidden sx={{ fontSize: '1em', opacity: 0.8 }} />
                  {provider.area}
                </Typography>
              ) : null}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {provider.website ? (
                  <Button
                    component="a"
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                  >
                    Visiter le site
                  </Button>
                ) : null}

                {provider.email ? (
                  <Button component="a" href={`mailto:${provider.email}`} variant="outlined">
                    Contacter par email
                  </Button>
                ) : null}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
