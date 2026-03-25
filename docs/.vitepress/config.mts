import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Gray-core',
  description: 'Network proxy platform for educational research',
  lang: 'en',

  base: '/Gray-core/',

  // Ignore dead links during build
  ignoreDeadLinks: true,

  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      link: '/ru/'
    }
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'TSPU (RU)', link: '/ru/tspu/' },
      { text: 'Русский', link: '/ru/' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Home',
          items: [
            { text: 'About Gray-core', link: '/' },
          ]
        },
        {
          text: 'TSPU Research (Russian)',
          items: [
            { text: 'Overview', link: 'https://xpos587.github.io/Gray-core/ru/tspu/' },
            { text: 'DPI Research', link: 'https://xpos587.github.io/Gray-core/ru/tspu/research' },
            { text: 'Packet Morphing', link: 'https://xpos587.github.io/Gray-core/ru/tspu/packet-morphing' },
            { text: 'Timing Randomization', link: 'https://xpos587.github.io/Gray-core/ru/tspu/timing-randomization' },
            { text: 'User Guide', link: 'https://xpos587.github.io/Gray-core/ru/tspu/user-guide' },
          ]
        }
      ],
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
  },

  markdown: {
    languages: [
      {
        id: 'ru',
        label: 'Russian',
        searchLabel: 'Поиск на русском',
        search: {
          translator: (text) => text
        }
      }
    ]
  }
})
