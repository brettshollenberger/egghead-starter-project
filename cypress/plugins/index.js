// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const db = require('../../db-seeder')

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    // deconstruct the individual properties
    hello ({ greeting, name }) {
      console.log('%s, %s', greeting, name)
  
      return null
    },

    'db:seed': (inputSeeds) => {
      let defaultSeed = {todos: []}
      let seeds = inputSeeds ? inputSeeds : defaultSeed;

      db.seed(seeds)

      return null
    },

    'rubySeed': (seeds) => {
      db.rbSeed(seeds)

      return null
    }
  })

}