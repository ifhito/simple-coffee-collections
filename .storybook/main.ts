import type { StorybookConfig } from '@storybook/react-webpack5'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-webpack5-compiler-swc',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    const alias = config.resolve?.alias ?? {}

    if (Array.isArray(alias)) {
      alias.push(
        { name: '@', alias: projectRoot },
        { name: 'next/link', alias: path.resolve(projectRoot, '.storybook/mocks/next-link.tsx') },
        { name: 'next/navigation', alias: path.resolve(projectRoot, '.storybook/mocks/next-navigation.ts') },
        { name: '@/lib/actions/auth', alias: path.resolve(projectRoot, '.storybook/mocks/auth.ts') },
      )
      config.resolve = { ...config.resolve, alias }
      return config
    }

    config.resolve = {
      ...config.resolve,
      alias: {
        ...alias,
        '@': projectRoot,
        'next/link': path.resolve(projectRoot, '.storybook/mocks/next-link.tsx'),
        'next/navigation': path.resolve(projectRoot, '.storybook/mocks/next-navigation.ts'),
        '@/lib/actions/auth': path.resolve(projectRoot, '.storybook/mocks/auth.ts'),
      },
    }

    const rules = config.module?.rules
    if (Array.isArray(rules)) {
      const cssRule = rules.find((rule) => {
        if (!rule || typeof rule !== 'object' || !('test' in rule)) {
          return false
        }
        return rule.test instanceof RegExp && rule.test.test('test.css')
      })

      if (cssRule && typeof cssRule === 'object' && Array.isArray(cssRule.use)) {
        const hasPostcss = cssRule.use.some((entry) => {
          if (typeof entry === 'string') {
            return entry.includes('postcss-loader')
          }
          return typeof entry === 'object' && 'loader' in entry && typeof entry.loader === 'string'
            ? entry.loader.includes('postcss-loader')
            : false
        })

        if (!hasPostcss) {
          cssRule.use.push({
            loader: require.resolve('postcss-loader'),
            options: {
              postcssOptions: {
                config: path.resolve(projectRoot, 'postcss.config.mjs'),
              },
            },
          })
        }
      }
    }

    return config
  },
}

export default config
