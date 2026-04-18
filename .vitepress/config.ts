import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Wiki',
  description: 'Personal knowledge base',
  base: '/wiki/',
  lastUpdated: true,
  srcExclude: ['raw/**', 'README.md'],
  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: 'Concepts', link: '/concepts/packaging-design-workflow' },
      { text: 'Entities', link: '/entities/oishii' },
      { text: 'Log', link: '/log' },
    ],

    sidebar: {
      '/concepts/': [
        {
          text: 'Concepts',
          items: [
            { text: 'Brief Decomposition', link: '/concepts/brief-decomposition' },
            { text: 'Cybernetic Goal Correction', link: '/concepts/cybernetic-goal-correction' },
            { text: 'Identity Based Change', link: '/concepts/identity-based-change' },
            { text: 'Packaging Design Workflow', link: '/concepts/packaging-design-workflow' },
            { text: 'Packaging Storytelling', link: '/concepts/packaging-storytelling' },
            { text: 'Packaging Strategy Positioning', link: '/concepts/packaging-strategy-positioning' },
            { text: 'Sustainable Packaging', link: '/concepts/sustainable-packaging' },
            { text: 'Tea Packaging Information Architecture', link: '/concepts/tea-packaging-information-architecture' },
            { text: 'Top Seal Packaging', link: '/concepts/top-seal-packaging' },
            { text: 'Transparent Labeling', link: '/concepts/transparent-labeling' },
          ]
        }
      ],
      '/entities/': [
        {
          text: 'Entities',
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
      // Simple wikilink support: [[page-name]] -> [page-name](/wiki/page-name)
      md.inline.ruler.before('link', 'wikilink', (state, silent) => {
        const match = state.src.slice(state.pos).match(/^\[\[([^\]]+)\]\]/)
        if (!match) return false
        if (!silent) {
          const token = state.push('link_open', 'a', 1)
          const page = match[1].trim().toLowerCase().replace(/\s+/g, '-')
          token.attrs = [['href', `/wiki/${page}`]]
          const textToken = state.push('text', '', 0)
          textToken.content = match[1]
          state.push('link_close', 'a', -1)
        }
        state.pos += match[0].length
        return true
      })
    }
  }
})
