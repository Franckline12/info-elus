import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import SectionHeading from '@/components/SectionHeading'
import type { Article } from '@/payload-types'
import { rule } from '@/theme/tokens'

import ArticleCard from './ArticleCard'

type Props = {
  articles: Article[]
}

/** « Sur le même sujet » : 3 contenus liés, séparés par des filets. */
export function RelatedArticles({ articles }: Props) {
  if (articles.length === 0) return null

  return (
    <Box component="section" aria-labelledby="sur-le-meme-sujet" sx={{ mt: { xs: 6, md: 9 } }}>
      <SectionHeading id="sur-le-meme-sujet" title="Sur le même sujet" />

      <Grid container spacing={{ xs: 4, md: 4 }}>
        {articles.map((article) => (
          <Grid
            key={article.id}
            size={{ xs: 12, sm: 6, md: 4 }}
            sx={{
              borderTop: { xs: `1px solid ${rule}`, sm: 'none' },
              borderLeft: { sm: `1px solid ${rule}` },
              pt: { xs: 3, sm: 0 },
              pl: { sm: 3 },
              '&:first-of-type': { borderTop: 'none', borderLeft: 'none', pt: 0, pl: { sm: 0 } },
            }}
          >
            <ArticleCard article={article} showImage={false} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default RelatedArticles
