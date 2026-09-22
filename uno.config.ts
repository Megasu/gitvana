import { defineConfig, presetUno, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
  ],
  theme: {
    colors: {
      // PICO-8 inspired palette
      bg: '#0a0a0a',
      terminal: '#00ff41',
      'terminal-dim': '#00aa2a',
      accent: '#ff004d',
      warn: '#ffa300',
      info: '#29adff',
      success: '#00e436',
      muted: '#5f574f',
      panel: '#1a1a2e',
      'panel-border': '#2a2a4e',
    },
    fontFamily: {
      // CJK fallbacks appended so Chinese renders with a proper system font
      // (the pixel/mono Latin fonts have no CJK glyphs) without disturbing
      // the Latin typography.
      retro: ['"Press Start 2P"', '"PingFang SC"', '"Microsoft YaHei"', 'monospace'],
      mono: ['JetBrains Mono', 'Consolas', '"PingFang SC"', '"Microsoft YaHei"', 'monospace'],
    },
  },
});
