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
      '/concepts/': [
        {
          text: '流程方法论',
          collapsed: false,
          items: [
            { text: 'Brief 拆解', link: '/concepts/brief-decomposition' },
            { text: '设计全流程', link: '/concepts/packaging-design-workflow' },
            { text: '策略定位', link: '/concepts/packaging-strategy-positioning' },
            { text: '故事化叙事', link: '/concepts/packaging-storytelling' },
          ]
        },
        {
          text: '材料与工艺',
          collapsed: false,
          items: [
            { text: '可持续包装', link: '/concepts/sustainable-packaging' },
            { text: '顶部密封', link: '/concepts/top-seal-packaging' },
            { text: '透明标签', link: '/concepts/transparent-labeling' },
          ]
        },
        {
          text: '行业案例',
          collapsed: false,
          items: [
            { text: '茶叶包装信息架构', link: '/concepts/tea-packaging-information-architecture' },
          ]
        },
        {
          text: '思维模型',
          collapsed: true,
          items: [
            { text: '控制论式目标校正', link: '/concepts/cybernetic-goal-correction' },
            { text: '身份式改变', link: '/concepts/identity-based-change' },
          ]
        },
      ],
      '/entities/': [
        {
          text: 'Entities',
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
