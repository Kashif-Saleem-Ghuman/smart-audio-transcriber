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
    'success-lighten': '#dcfce7',
    error: '#ef4444',
    'error-lighten': '#fee2e2',
    warning: '#f59e0b',
    info: '#3b82f6',
    background: '#f8fafc',
    surface: '#ffffff',
    'surface-variant': '#F3F4F6',
    'border-color': '#E5E7EB',
    'on-success': '#ffffff',
    'on-error': '#ffffff',
    'on-surface': '#1e293b', // Add this for better text contrast
    'tooltip-background': '#1e293b', // Add this for tooltip background
    'tooltip-text': '#000', // Add this for tooltip text
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
    VTooltip: {  
      color: 'tooltip-background',
      contentClass: 'text-tooltip-text',
    },
  },
}

export default createVuetify(vuetifyConfig)
