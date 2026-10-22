import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    pageLoadTimeout: 45000,
    defaultCommandTimeout: 10000,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
})
