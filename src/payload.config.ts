import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateDescription, GenerateTitle } from '@payloadcms/plugin-seo/types'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Themes } from './collections/Themes'
import { Tags } from './collections/Tags'
import { Articles } from './collections/Articles'
import { Guides } from './collections/Guides'
import { Quizzes } from './collections/Quizzes'
import { QuizResults } from './collections/QuizResults'
import { Providers } from './collections/Providers'
import { ProviderSubscriptions } from './collections/ProviderSubscriptions'
import { Testimonials } from './collections/Testimonials'
import { Subscribers } from './collections/Subscribers'
import { fr } from '@payloadcms/translations/languages/fr'
import { emailAdapter } from './lib/email/adapter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Forme commune aux contenus indexables : les articles portent un chapô
 * (`excerpt`), les guides un résumé court (`summary`), les quiz une
 * introduction (`intro`), les prestataires un nom et une description courte.
 */
type SeoDoc = {
  title?: string | null
  excerpt?: string | null
  summary?: string | null
  intro?: string | null
  name?: string | null
  shortDescription?: string | null
}

/**
 * Les prestataires sont titrés « Nom — Prestataires — Infos Élus » : l'annuaire
 * est une rubrique à part, et le nom seul ne dirait pas assez de quoi il s'agit
 * dans une page de résultats.
 */
const generateTitle: GenerateTitle<SeoDoc> = ({ collectionSlug, doc }) =>
  collectionSlug === 'providers'
    ? `${doc?.name ?? ''} — Prestataires — Infos Élus`
    : `${doc?.title ?? ''} — Infos Élus`

const generateDescription: GenerateDescription<SeoDoc> = ({ doc }) =>
  doc?.excerpt ?? doc?.summary ?? doc?.intro ?? doc?.shortDescription ?? ''

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Themes,
    Tags,
    Articles,
    Guides,
    Quizzes,
    QuizResults,
    Providers,
    ProviderSubscriptions,
    Testimonials,
    Subscribers,
  ],
  editor: lexicalEditor(),
  email: emailAdapter(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['articles', 'guides', 'quizzes', 'providers'],
      tabbedUI: true,
      uploadsCollection: 'media',
      generateTitle,
      generateDescription,
    }),
  ],
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { fr },
  },
})
