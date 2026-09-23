import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import SectionHeading from '@/components/SectionHeading'
import type { Article } from '@/payload-types'

import ArticleCard from './ArticleCard'

type Props = {
  articles: Article[]
}

/** « Sur le même sujet » : 3 contenus liés, en vignettes. */
export function RelatedArticles({ articles }: Props) {
  if (articles.length === 0) return null

  return (
    <Box component="section" aria-labelledby="sur-le-meme-sujet" sx={{ mt: { xs: 5, md: 7 } }}>
      <SectionHeading id="sur-le-meme-sujet" title="Sur le même sujet" />

      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {articles.map((article) => (
          <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <ArticleCard article={article} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default RelatedArticles
