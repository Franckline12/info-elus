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
import { ProviderCategories } from './collections/ProviderCategories'
import { Articles } from './collections/Articles'
import { Guides } from './collections/Guides'
import { Quizzes } from './collections/Quizzes'
import { QuizResults } from './collections/QuizResults'
import { Providers } from './collections/Providers'
import { ProviderSubscriptions } from './collections/ProviderSubscriptions'
import { Organizers } from './collections/Organizers'
import { Events } from './collections/Events'
import { Testimonials } from './collections/Testimonials'
import { Subscribers } from './collections/Subscribers'
import { fr } from '@payloadcms/translations/languages/fr'
import { emailAdapter } from './lib/email/adapter'
import { eventSeoDescription } from './lib/events'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Forme commune aux contenus indexables : les articles portent un chapô
 * (`excerpt`), les guides un résumé court (`summary`), les quiz une
 * introduction (`intro`), les prestataires un nom et une description courte,
 * les salons une ville, un lieu et des dates.
 */
type SeoDoc = {
  title?: string | null
  excerpt?: string | null
  summary?: string | null
  intro?: string | null
  name?: string | null
  shortDescription?: string | null
  city?: string | null
  venue?: string | null
  startDate?: string | null
  endDate?: string | null
}

/**
 * Les prestataires sont titrés « Nom — Prestataires — Infos Élus » et les
 * salons « Titre — Salons CSE — Infos Élus » : ce sont des rubriques à part,
 * et le titre seul ne dirait pas assez de quoi il s'agit dans une page de
 * résultats.
 */
const generateTitle: GenerateTitle<SeoDoc> = ({ collectionSlug, doc }) => {
  if (collectionSlug === 'providers') return `${doc?.name ?? ''} — Prestataires — Infos Élus`
  if (collectionSlug === 'events') return `${doc?.title ?? ''} — Salons CSE — Infos Élus`
  return `${doc?.title ?? ''} — Infos Élus`
}

const generateDescription: GenerateDescription<SeoDoc> = ({ collectionSlug, doc }) => {
  if (collectionSlug === 'events' && doc) return eventSeoDescription(doc)
  return doc?.excerpt ?? doc?.summary ?? doc?.intro ?? doc?.shortDescription ?? ''
}

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
    ProviderCategories,
    Articles,
    Guides,
    Quizzes,
    QuizResults,
    Providers,
    ProviderSubscriptions,
    Organizers,
    Events,
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
      collections: ['articles', 'guides', 'quizzes', 'providers', 'events'],
      tabbedUI: true,
      uploadsCollection: 'media',
      generateTitle,
      generateDescription,
      // 60 et 160 caractères sont les seuils d'affichage de Google : le plugin
      // applique ces valeurs à la fois à la validation du champ et à son
      // indicateur de longueur natif (`MetaTitleComponent`/`MetaDescriptionComponent`
      // lisent `field.maxLength`), donc pas de second indicateur à construire.
      fields: ({ defaultFields }) =>
        defaultFields.map((field) => {
          if ('name' in field && field.name === 'title') {
            return { ...field, maxLength: 60 }
          }
          if ('name' in field && field.name === 'description') {
            return { ...field, maxLength: 160 }
          }
          return field
        }),
    }),
  ],
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { fr },
  },
})
