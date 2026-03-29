import * as reactPlugin from 'vite-plugin-react'
import type { UserConfig } from 'vite'

const config: UserConfig = {
  jsx: 'react',
  base: './',
  plugins: [reactPlugin as any]
}

export default config
