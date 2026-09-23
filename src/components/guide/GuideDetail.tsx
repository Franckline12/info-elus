import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import ArticleToc from '@/components/article/ArticleToc'
import ShareLinks from '@/components/article/ShareLinks'
import Breadcrumb from '@/components/Breadcrumb'
import Container from '@/components/Container'
import JsonLd from '@/components/JsonLd'
import MediaImage from '@/components/MediaImage'
import RichText from '@/components/RichText'
import SectionHeading from '@/components/SectionHeading'
import TagList from '@/components/TagList'
import type { TagListItem } from '@/components/TagList'
import { toDateTimeAttribute } from '@/lib/formatDate'
import { guidePath, guidesPath, themePath } from '@/lib/routes'
import { absoluteUrl, siteName } from '@/lib/site'
import { asTheme, themeColor } from '@/lib/themeColor'
import { guideToc } from '@/lib/toc'
import type { Guide, Media, Tag } from '@/payload-types'
import { colors, radius } from '@/theme/tokens'

import GuideCard from './GuideCard'
import GuideResources from './GuideResources'

type Props = {
  guide: Guide
  related: Guide[]
}

/** Assez d'air sous l'en-tête pour qu'un titre visé par une ancre reste lisible. */
const SCROLL_MARGIN = 96

const asTags = (value: Guide['tags']): TagListItem[] =>
  (value ?? []).filter((tag): tag is Tag => typeof tag === 'object' && tag !== null)

const asMedia = (value: Media | number | null | undefined): Media | null =>
  value && typeof value === 'object' ? value : null

/** Gabarit d'un guide : colonne de lecture, sommaire et ressources (§ 2.2). */
export function GuideDetail({ guide, related }: Props) {
  const theme = asTheme(guide.theme)
  const tags = asTags(guide.tags)
  const image = asMedia(guide.featuredImage)
  const url = absoluteUrl(guidePath(guide))
  const toc = guideToc(guide.sections)
  const accent = themeColor(theme?.color)
  const resources = guide.resources ?? []
  const hasAside = toc.length > 0 || resources.length > 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.summary,
    ...(image?.url ? { image: [absoluteUrl(image.url)] } : {}),
    ...(guide.publishedAt ? { datePublished: toDateTimeAttribute(guide.publishedAt) } : {}),
    dateModified: toDateTimeAttribute(guide.updatedAt),
    ...(theme ? { articleSection: theme.name } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: siteName, url: absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: siteName, url: absoluteUrl('/') },
  }

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <JsonLd data={jsonLd} />

      {image ? (
        <Box
          component="figure"
          sx={{ m: 0, mb: { xs: 2.5, md: 3 }, borderRadius: `${radius}px`, overflow: 'hidden' }}
        >
          <MediaImage media={image} ratio={3 / 1} sizes="100vw" priority />
        </Box>
      ) : null}

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Guides', href: guidesPath },
          ...(theme
            ? [{ label: theme.name, href: theme.slug ? themePath(theme.slug) : undefined }]
            : []),
          { label: guide.title },
        ]}
      />

      <Grid container spacing={{ xs: 3, md: 5 }} sx={{ mt: { xs: 0, md: 0.5 } }}>
        <Grid size={{ xs: 12, md: hasAside ? 8 : 12 }}>
          <Box component="article">
            <Box component="header">
              {theme ? (
                <Box sx={{ mb: 2 }}>
                  <AppLink
                    href={theme.slug ? themePath(theme.slug) : guidesPath}
                    underline="none"
                    sx={{ display: 'inline-flex' }}
                  >
                    <Chip
                      label={theme.name}
                      size="small"
                      sx={{ backgroundColor: colors.bluePale, color: accent, fontWeight: 500 }}
                    />
                  </AppLink>
                </Box>
              ) : null}

              <Typography
                variant="h1"
                component="h1"
                sx={{ fontSize: 'clamp(1.75rem, 1.3rem + 1.8vw, 2.5rem)', mb: 2 }}
              >
                {guide.title}
              </Typography>

              <Typography variant="lede" component="p" sx={{ color: 'text.secondary', mb: 2 }}>
                {guide.summary}
              </Typography>

            </Box>

            <Divider sx={{ my: { xs: 3, md: 4 } }} />

            {(guide.sections ?? []).map((section) => (
              <Box component="section" key={section.id ?? section.anchor}>
                <Typography
                  id={section.anchor ?? undefined}
                  variant="h2"
                  component="h2"
                  sx={{ mt: 6, mb: 2, scrollMarginTop: SCROLL_MARGIN }}
                >
                  {section.heading}
                </Typography>
                <RichText data={section.content} />
              </Box>
            ))}

            {tags.length > 0 ? (
              <Box sx={{ mt: 5 }}>
                <TagList tags={tags} />
              </Box>
            ) : null}

            <Divider sx={{ my: 4 }} />

            <ShareLinks url={url} title={guide.title} />
          </Box>
        </Grid>

        {hasAside ? (
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 24 },
                display: 'grid',
                gap: { xs: 2, md: 2.5 },
              }}
            >
              <ArticleToc entries={toc} />
              <GuideResources resources={resources} />
            </Box>
          </Grid>
        ) : null}
      </Grid>

      {related.length > 0 ? (
        <Box component="section" aria-labelledby="meme-theme" sx={{ mt: { xs: 5, md: 7 } }}>
          <SectionHeading id="meme-theme" title="Dans le même thème" />
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {related.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <GuideCard guide={item} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}
    </Container>
  )
}

export default GuideDetail
