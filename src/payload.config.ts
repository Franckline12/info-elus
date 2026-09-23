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
import { Providers } from './collections/Providers'
import { Testimonials } from './collections/Testimonials'
import type { Article } from './payload-types'
import { fr } from '@payloadcms/translations/languages/fr'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const generateTitle: GenerateTitle<Article> = ({ doc }) => `${doc?.title ?? ''} — Infos Élus`

const generateDescription: GenerateDescription<Article> = ({ doc }) => doc?.excerpt ?? ''

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
    Providers,
    Testimonials,
  ],
  editor: lexicalEditor(),
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
      collections: ['articles', 'guides'],
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
