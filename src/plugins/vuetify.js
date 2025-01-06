/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const customTheme = {
  dark: false,
  colors: {
    primary: '#2563eb', // Keep existing Modern blue
    secondary: '#475569', // Keep existing Slate gray
    accent: '#0ea5e9', // Keep existing Sky blue
    success: '#22c55e', // Keep existing
    error: '#ef4444', // Keep existing
    warning: '#f59e0b', // Keep existing
    info: '#3b82f6', // Keep existing
    background: '#f8fafc', // Keep existing
    surface: '#ffffff', // Keep existing
    // Add new grays for specific UI elements
    'surface-variant': '#F3F4F6', // Light gray for hover states
    'border-color': '#E5E7EB', // Light gray for borders
  }
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
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
})
