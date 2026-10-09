import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'

import type { Testimonial } from '@/payload-types'
import { colors, fonts } from '@/theme/tokens'

type Props = {
  testimonial: Testimonial
}

/** Parole d'élu, à côté du bloc newsletter (§ 2.6). */
export function TestimonialCard({ testimonial }: Props) {
  return (
    <Card component="aside" aria-label="Parole d’élu" sx={{ height: '100%' }}>
      <CardContent
        sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: { xs: 2.5, md: 3 } }}
      >
        <FormatQuoteIcon
          aria-hidden
          sx={{ color: colors.blueBright, fontSize: '1.75rem', mb: 1 }}
        />

        <Typography
          component="blockquote"
          sx={{
            m: 0,
            fontFamily: fonts.serif,
            fontSize: { xs: '1.0625rem', md: '1.1875rem' },
            lineHeight: 1.5,
            color: 'text.primary',
          }}
        >
          « {testimonial.quote} »
        </Typography>

        {testimonial.author || testimonial.role ? (
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Typography component="p" sx={{ fontSize: '0.875rem', fontWeight: 700, m: 0 }}>
              {testimonial.author}
            </Typography>
            {testimonial.role ? (
              <Typography
                component="p"
                sx={{ fontSize: '0.8125rem', color: 'text.secondary', m: 0 }}
              >
                {testimonial.role}
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default TestimonialCard
