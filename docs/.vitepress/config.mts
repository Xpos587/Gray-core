import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Gray-core',
  description: 'Network proxy platform for educational research',

  base: '/Gray-core/',

  // Ignore dead links during build
  ignoreDeadLinks: true,

  // Don't set global lang - use locales only
  // lang: 'en', // REMOVED - was causing conflicts

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Language', link: '/ru/' },
        ],

        sidebar: {
          '/': [
            {
              text: 'Home',
              items: [
                { text: 'Language Selection', link: '/' },
              ]
            },
            {
              text: 'English',
              items: [
                { text: 'Documentation', link: '/en/' },
              ]
            },
            {
              text: 'TSPU Research (Russian)',
              items: [
                { text: 'Overview', link: '/ru/tspu/' },
                { text: 'Research', link: '/ru/tspu/research' },
                { text: 'Packet Morphing', link: '/ru/tspu/packet-morphing' },
                { text: 'Timing Randomization', link: '/ru/tspu/timing-randomization' },
                { text: 'User Guide', link: '/ru/tspu/user-guide' },
              ]
            }
          ],
          '/en/': [
            {
              text: 'Home',
              items: [
                { text: 'Language Selection', link: '/' },
              ]
            },
            {
              text: 'Documentation',
              items: [
                { text: 'Overview', link: '/en/' },
                { text: 'Developer Guides', link: '/en/dev/' },
              ]
            },
            {
              text: 'TSPU Research (Russian)',
              items: [
                { text: 'Overview', link: '/ru/tspu/' },
                { text: 'Research', link: '/ru/tspu/research' },
                { text: 'Packet Morphing', link: '/ru/tspu/packet-morphing' },
                { text: 'Timing Randomization', link: '/ru/tspu/timing-randomization' },
                { text: 'User Guide', link: '/ru/tspu/user-guide' },
              ]
            }
          ]
        },

        social: [
          { icon: 'github', link: 'https://github.com/Xpos587/Gray-core' }
        ],

        footer: {
          message: 'MPL-2.0 License | Educational Research Only',
          copyright: 'Copyright © 2026 Xpos587'
        },

        editLink: {
          pattern: 'https://github.com/Xpos587/Gray-core/edit/main/docs/:path',
          text: 'Edit this page on GitHub'
        }
      }
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      link: '/ru/',
      themeConfig: {
        nav: [
          { text: 'Главная', link: '/ru/' },
          { text: 'Language', link: '/' },
        ],

        sidebar: {
          '/ru/': [
            {
              text: 'Главная',
              items: [
                { text: 'О Gray-core', link: '/ru/' },
              ]
            },
            {
              text: 'TSPU (Исследования)',
              items: [
                { text: 'Обзор', link: '/ru/tspu/' },
                { text: 'Исследования', link: '/ru/tspu/research' },
                { text: 'Packet Morphing', link: '/ru/tspu/packet-morphing' },
                { text: 'Timing Randomization', link: '/ru/tspu/timing-randomization' },
                { text: 'Руководство пользователя', link: '/ru/tspu/user-guide' },
              ]
            },
            {
              text: 'Разработчикам',
              items: [
                { text: 'Архитектура', link: '/ru/dev/architecture' },
                { text: 'Contributing', link: '/ru/dev/contributing' },
              ]
            }
          ]
        },

        social: [
          { icon: 'github', link: 'https://github.com/Xpos587/Gray-core' }
        ],

        footer: {
          message: 'MPL-2.0 License | Educational Research Only',
          copyright: 'Copyright © 2026 Xpos587'
        },

        editLink: {
          pattern: 'https://github.com/Xpos587/Gray-core/edit/main/docs/:path',
          text: 'Edit this page on GitHub'
        }
      }
    }
  },

  markdown: {
    // Removed languages config to avoid Shiki grammar loading issues
  },

  vite: {
    build: {
      minify: 'esbuild'
    }
  }
})
