import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

const WIKI_ROOT = path.resolve(__dirname, '..')

/**
 * Scan all .md files in wiki root and build a map:
 *   "file-name" -> "/wiki/concepts/file-name"
 *
 * Excludes: raw/, .vitepress/, node_modules/, .git/, README.md
 */
function buildWikiLinkMap(): Record<string, string> {
  const map: Record<string, string> = {}
  const excludeDirs = new Set(['raw', '.vitepress', 'node_modules', '.git', '.obsidian'])

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      const relPath = path.relative(WIKI_ROOT, fullPath)

      if (entry.isDirectory()) {
        if (!excludeDirs.has(entry.name)) {
          walk(fullPath)
        }
        continue
      }

      if (!entry.name.endsWith('.md')) continue
      if (entry.name === 'README.md') continue

      const basename = entry.name.slice(0, -3) // remove .md
      const route = '/' + relPath.slice(0, -3).replace(/\\/g, '/')

      // If duplicate name exists, prefer concepts > entities > root
      if (map[basename]) {
        const currentPriority = map[basename].includes('/concepts/') ? 3 : map[basename].includes('/entities/') ? 2 : 1
        const newPriority = route.includes('/concepts/') ? 3 : route.includes('/entities/') ? 2 : 1
        if (newPriority > currentPriority) {
          map[basename] = route
        }
      } else {
        map[basename] = route
      }
    }
  }

  walk(WIKI_ROOT)
  return map
}

const wikiLinkMap = buildWikiLinkMap()

type SidebarItem = { text: string; link: string }
type SidebarGroup = { text: string; collapsed: boolean; items: SidebarItem[] }

function getFrontmatterValue(content: string, key: string): string | undefined {
  const fm = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fm) return undefined
  const line = fm[1].split('\n').find((l) => l.trim().startsWith(`${key}:`))
  return line?.replace(new RegExp(`^${key}:\\s*`), '').trim().replace(/^['"]|['"]$/g, '')
}

function getMarkdownTitle(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8')
  const fmTitle = getFrontmatterValue(content, 'title')
  if (fmTitle) return fmTitle
  const h1 = content.match(/^#\s+(.+)$/m)
  if (h1) return h1[1].replace(/\s*\(.+?\)\s*$/, '').trim()
  return path.basename(filePath, '.md')
}

function listMarkdownPages(dirName: string): SidebarItem[] {
  const dir = path.join(WIKI_ROOT, dirName)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const fullPath = path.join(dir, name)
      return {
        text: getMarkdownTitle(fullPath),
        link: `/${dirName}/${name.replace(/\.md$/, '')}`,
      }
    })
    .sort((a, b) => a.text.localeCompare(b.text, 'zh-Hans'))
}

function pickItems(all: SidebarItem[], slugs: string[]): SidebarItem[] {
  const bySlug = new Map(all.map((item) => [item.link.split('/').pop(), item]))
  return slugs.map((slug) => bySlug.get(slug)).filter(Boolean) as SidebarItem[]
}

function withoutPicked(all: SidebarItem[], groups: SidebarGroup[]): SidebarItem[] {
  const picked = new Set(groups.flatMap((g) => g.items.map((item) => item.link)))
  return all.filter((item) => !picked.has(item.link))
}

function buildConceptSidebar(): SidebarGroup[] {
  const all = listMarkdownPages('concepts')
  const groups: SidebarGroup[] = [
    {
      text: '流程方法论',
      collapsed: false,
      items: pickItems(all, [
        'brief-decomposition',
        'packaging-design-workflow',
        'packaging-strategy-positioning',
        'packaging-storytelling',
        'dieline-awards-2025',
      ]),
    },
    {
      text: '材料与工艺',
      collapsed: false,
      items: pickItems(all, [
        'hot-stamping',
        'sustainable-packaging',
        'top-seal-packaging',
        'transparent-labeling',
        'refillable-packaging',
        'inclusive-packaging',
        'geometric-packaging',
      ]),
    },
    {
      text: '行业案例',
      collapsed: false,
      items: pickItems(all, [
        'tea-packaging-information-architecture',
        'heritage-design',
        'private-label-redesign',
        'theatrical-packaging',
      ]),
    },
    {
      text: '思维模型',
      collapsed: true,
      items: pickItems(all, [
        'cybernetic-goal-correction',
        'identity-based-change',
      ]),
    },
  ]

  const uncategorized = withoutPicked(all, groups)
  if (uncategorized.length) {
    groups.push({ text: '未分类', collapsed: false, items: uncategorized })
  }
  return groups
}

const conceptSidebar = buildConceptSidebar()

export default defineConfig({
  title: 'Ethan Wiki',
  description: 'Personal knowledge base',
  base: '/wiki/',
  lastUpdated: true,
  srcExclude: ['raw/**', 'README.md'],
  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Concepts', link: '/concepts/packaging-design-workflow' },
      { text: 'Entities', link: '/entities/oishii' },
      { text: 'Log', link: '/log' },
    ],

    sidebar: {
      '/concepts/': conceptSidebar,
      '/entities/': [
        {
          text: '食品与饮料',
          collapsed: false,
          items: [
            { text: 'BIS! (Sammontana)', link: '/entities/bis' },
            { text: 'BUILT', link: '/entities/built' },
            { text: 'Banana Milk', link: '/entities/banana-milk' },
            { text: 'Better Bagel', link: '/entities/better-bagel' },
            { text: 'Diana\'s Seafood', link: '/entities/dianas-seafood' },
            { text: 'Gli Speciali by Alica', link: '/entities/gli-speciali' },
            { text: 'Graza', link: '/entities/graza' },
            { text: 'Manischewitz', link: '/entities/manischewitz' },
            { text: 'Matty Matheson Pantry', link: '/entities/matty-matheson' },
            { text: 'Moment Mints', link: '/entities/moment-mints' },
            { text: 'Sitko Pizza', link: '/entities/sitko-pizza' },
            { text: 'Songhua River Rice', link: '/entities/songhua-river-rice' },
            { text: 'Yiayia and Friends', link: '/entities/yiayia-and-friends' },
          ]
        },
        {
          text: '美妆与个护',
          collapsed: false,
          items: [
            { text: 'BREVRN Fragrances', link: '/entities/brevrn-fragrances' },
            { text: 'Mittereum', link: '/entities/mittereum' },
            { text: 'Wild', link: '/entities/wild' },
            { text: 'Workflow Candles', link: '/entities/workflow-candles' },
          ]
        },
        {
          text: '零售与品牌',
          collapsed: false,
          items: [
            { text: 'ABCs', link: '/entities/abcs' },
            { text: 'Bezi (Labneh)', link: '/entities/bezi' },
            { text: 'Cora', link: '/entities/cora' },
            { text: 'Gifted', link: '/entities/gifted' },
            { text: 'Mr. Heer\'s', link: '/entities/mr-heer' },
            { text: 'Nazionale', link: '/entities/nazionale' },
            { text: 'Walmart Great Value', link: '/entities/walmart-great-value' },
          ]
        },
        {
          text: '其他',
          collapsed: false,
          items: [
            { text: 'Oishii', link: '/entities/oishii' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/lihuluu/wiki' }
    ],

    search: {
      provider: 'local'
    }
  },

  markdown: {
    config: (md) => {
      md.inline.ruler.before('link', 'wikilink', (state, silent) => {
        const match = state.src.slice(state.pos).match(/^\[\[([^\]]+)\]\]/)
        if (!match) return false
        if (!silent) {
          const rawName = match[1].trim()
          const slug = rawName.toLowerCase().replace(/\s+/g, '-')
          const href = wikiLinkMap[slug] || `/wiki/${slug}`

          const token = state.push('link_open', 'a', 1)
          token.attrs = [['href', href]]
          const textToken = state.push('text', '', 0)
          textToken.content = rawName
          state.push('link_close', 'a', -1)
        }
        state.pos += match[0].length
        return true
      })
    }
  }
})
