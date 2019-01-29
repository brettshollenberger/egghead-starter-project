context('Todos', () => {
    it('properly fills in seeds, and displays them appropriately', () => {
        cy.seed([{'text': "Hello World"}, {'text': 'Goodnight Moon', completed: true}])
        cy.visit("/")

        // cy.get(':nth-child(1) > .view > label').should('have.text', 'Hello World')
        cy.get('[data-cy=todo-1]')
            .should('have.text', "Hello World")
            .should('not.have.class', 'completed')
            .find('.toggle')
            .should('not.be.checked')

        cy.get('[data-cy=todo-2]')
            .should('have.text', "Goodnight Moon")
            .should('have.class', 'completed')
            .find('.toggle')
            .should('be.checked')

        cy.store().should('deep.equal', {
            todos: [{
                id: 1,
                text: 'Hello World',
                completed: false
            }, {
                id: 2,
                text: 'Goodnight Moon',
                completed: true
            }],
            visibilityFilter: 'show_all'
        })

        // Cy.server does not need to stub responses, but can
        // spy on them instead. We can do this to await the
        // server response, and thereby eliminate flake
        cy.server()

        // We're going to spy on the create endpoint
        cy.route({
            method: 'POST',
            url: '/api/todos',
        }).as('createTodo')

        cy.get('.new-todo').type('3rd Todo{enter}')

        // We reference the alias createTodo, then check on its data
        cy.wait('@createTodo').then((xhr) => {
            assert.deepEqual(xhr.request.body, {
                completed: false,
                text: '3rd Todo'
            })
            assert.deepEqual(xhr.response.body, {
                completed: false,
                text: '3rd Todo',
                id: 3
            })
        })

        // We can now run assertions on the latest state of the store
        cy.store().should('deep.equal', {
            todos: [{
                id: 1,
                text: 'Hello World',
                completed: false
            }, {
                id: 2,
                text: 'Goodnight Moon',
                completed: true
            }, {
                id: 3,
                text: '3rd Todo',
                completed: false
            }],
            visibilityFilter: 'show_all'
        })

        // And we can assert that the 3rd list element contains the new data
        cy.get('[data-cy=todo-3]')
            .should('have.text', "3rd Todo")
            .should('not.have.class', 'completed')
            .find('.toggle')
            .should('not.be.checked')
    })
})