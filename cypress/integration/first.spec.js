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

    })
})