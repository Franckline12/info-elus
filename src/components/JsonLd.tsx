type Props = {
  data: Record<string, unknown>
}

/**
 * Données structurées schema.org. Rendu côté serveur dans un `<script>` :
 * aucun JavaScript n'est exécuté côté navigateur.
 */
export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // Les valeurs proviennent du CMS ; `JSON.stringify` échappe les guillemets,
      // on neutralise en plus la séquence `</script>`.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

export default JsonLd
