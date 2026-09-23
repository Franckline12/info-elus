import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined'
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined'
import type { SvgIconProps } from '@mui/material/SvgIcon'

import type { SectionIcon } from '@/lib/site'

/**
 * Icône d'une grande section, résolue depuis la clé portée par `navItems` et
 * `sectionShortcuts`. Le module `lib/site` reste ainsi sans dépendance à MUI,
 * ce qui lui permet d'être importé aussi bien côté serveur que côté client.
 */
const ICONS: Record<SectionIcon, React.ComponentType<SvgIconProps>> = {
  news: NewspaperOutlinedIcon,
  articles: ArticleOutlinedIcon,
  guides: MenuBookOutlinedIcon,
  quiz: ExtensionOutlinedIcon,
  providers: HandshakeOutlinedIcon,
}

type Props = SvgIconProps & {
  name: SectionIcon
}

export function SectionGlyph({ name, ...rest }: Props) {
  const Icon = ICONS[name]
  // Décoratif : le libellé textuel adjacent porte déjà l'information (§ 4.5).
  return <Icon aria-hidden {...rest} />
}

export default SectionGlyph
