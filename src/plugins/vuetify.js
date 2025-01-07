/**
 * @file Vuetify configuration and theme setup
 */

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

/**
 * Custom theme configuration for the application
 * @type {Object}
 */
const customTheme = {
  dark: false,
  colors: {
    primary: '#2563eb',
    secondary: '#475569',
    accent: '#0ea5e9',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    background: '#f8fafc',
    surface: '#ffffff',
    'surface-variant': '#F3F4F6',
    'border-color': '#E5E7EB',
  }
}

/**
 * Vuetify instance configuration
 * @type {import('vuetify').VuetifyOptions}
 */
const vuetifyConfig = {
  components,
  directives,
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme,
    },
  },
  defaults: {
    VCard: {
      elevation: 0,
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VBtn: {
      rounded: 'lg',
      height: 44,
      fontWeight: '600',
    },
  },
}

export default createVuetify(vuetifyConfig)
