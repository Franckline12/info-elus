import Box from '@mui/material/Box'

import type { Article } from '@/payload-types'
import { rule } from '@/theme/tokens'

import ArticleListItem from './ArticleListItem'

type Props = {
  articles: Article[]
}

/**
 * Liste secondaire du fil d'actualité (§ 2.3) : une grille éditoriale séparée
 * par des filets fins, sans carte arrondie ni ombre (§ 5.3). Les filets sont
 * portés ici plutôt que par chaque entrée, pour qu'ils restent alignés et que la
 * liste se ferme proprement en haut comme en bas.
 *
 * Partagée par `/actualite` et la section Actualité de l'accueil, afin que les
 * deux présentent le même fil.
 */
export function NewsFeed({ articles }: Props) {
  if (articles.length === 0) return null

  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {articles.map((article) => (
        <Box component="li" key={article.id}>
          <ArticleListItem article={article} />
        </Box>
      ))}
    </Box>
  )
}

export default NewsFeed
