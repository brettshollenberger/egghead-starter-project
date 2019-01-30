// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
const _ = require("lodash")

function* nextIdGen() {
    let id = 0;

    while (true) {
        yield id += 1;

        if (id > 10000) { id = 0; }
    }
}

Cypress.Commands.add("seed", (seeds) => {
    let nextId = nextIdGen();

    let mappedSeeds = seeds.map((seed) => {
        return {
            id: _.get(seed, 'id', nextId.next().value),
            text: _.get(seed, 'text', 'Hello World'),
            completed: _.get(seed, 'completed', false)
        }
    })
    cy.task('db:seed', {todos: mappedSeeds})
})

Cypress.Commands.add("store", (seeds) => {
    cy.window().its('store').invoke('getState')
})