context('Todos', () => {
    it('visits our page', () => {
        cy.task('db:seed')
        cy.task('hello', {greeting: 'hi', name: 'world'})
        cy.visit("/")
    })
})