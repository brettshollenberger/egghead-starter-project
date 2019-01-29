context('Todos', () => {
    it('visits our page', () => {
        cy.seed([{'text': "Hello World"}, {'text': 'Goodnight Moon', completed: true}])
        cy.task('rubySeed')
        // cy.task('hello', {greeting: 'hi', name: 'world'})
        cy.visit("/")
    })
})