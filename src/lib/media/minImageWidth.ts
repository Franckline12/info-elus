import type { UploadFieldSingleValidation } from 'payload'

/**
 * Rejette une image trop étroite pour l'usage du champ qui l'appelle (grand
 * format, hero…). Volontairement posé par champ et non sur la collection
 * Media entière : certains usages (logos de prestataires, ressources
 * téléchargeables) n'ont pas de largeur minimale à respecter.
 */
export const minImageWidth =
  (minWidth: number): UploadFieldSingleValidation =>
  async (value, { req }) => {
    if (!value) return true

    const media = await req.payload.findByID({
      collection: 'media',
      id: value as number | string,
      depth: 0,
      req,
    })

    if (!media?.width || !media.mimeType?.startsWith('image/')) return true

    return media.width >= minWidth
      ? true
      : `Image trop petite : ${media.width}px de large, ${minWidth}px minimum requis pour cet usage.`
  }
