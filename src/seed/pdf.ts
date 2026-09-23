/**
 * Générateur de PDF minimal, réservé aux jeux de données de démonstration.
 *
 * Les ressources téléchargeables d'un guide doivent être de vrais fichiers pour
 * que la taille, le type et le téléchargement se comportent comme en
 * production. Plutôt que de versionner des binaires, le seed en fabrique.
 */

/** Échappement des caractères réservés dans une chaîne littérale PDF. */
const escape = (value: string): string => value.replace(/([\\()])/g, '\\$1')

export function buildPdf(title: string, lines: string[]): Buffer {
  const content = [
    'BT',
    '/F1 16 Tf',
    '60 780 Td',
    `(${escape(title)}) Tj`,
    '/F1 11 Tf',
    ...lines.flatMap((line) => ['0 -24 Td', `(${escape(line)}) Tj`]),
    'ET',
  ].join('\n')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ' +
      '/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []

  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'))
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
  })

  const xrefOffset = Buffer.byteLength(pdf, 'latin1')

  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`

  // Le PDF n'est pas de l'UTF-8 : les offsets de la table xref comptent des
  // octets, d'où l'encodage latin1 de bout en bout.
  return Buffer.from(pdf, 'latin1')
}
