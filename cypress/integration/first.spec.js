import axios from "axios";

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

        // Asserting on db snapshots directly from the backend
        cy.task('db:snapshot').then((dbSnapshot) => {
            assert.deepEqual(dbSnapshot, [{
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
            }])

        })
    })

    function stubResponse(status, data) {
        return {
            "data": data,
            "status": status,
            "statusText": "Created",
            "headers": {
                "pragma": "no-cache",
                "content-type": "application/json; charset=utf-8",
                "location": "http://localhost:3001/api/todos/2",
                "cache-control": "no-cache",
                "expires": "-1"
            },
            "config": {
                "transformRequest": {},
                "transformResponse": {},
                "timeout": 0,
                "xsrfCookieName": "XSRF-TOKEN",
                "xsrfHeaderName": "X-XSRF-TOKEN",
                "maxContentLength": -1,
                "headers": {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json;charset=utf-8"
                },
                "method": "post",
                "url": "http://localhost:3001/api/todos",
                "data": "{\"text\":\"2nd Todo\",\"completed\":false}"
            },
            "request": {
                "method": "POST",
                "url": "http://localhost:3001/api/todos",
                "id": "xhr26"
            }
        }
    }

    // Using Cypress to assert multiple backend failures
    it('stubs out when request retries fail', () => {
        cy.seed([{'text': "Hello World"}])
        cy.visit("/")

        // Assert there is only one item
        cy.get('[data-cy=todo-list]')
            .children()
            .should('have.length', 1)

        cy.store().should('deep.equal', {
            todos: [{
                id: 1,
                text: 'Hello World',
                completed: false
            }],
            visibilityFilter: 'show_all'
        })

        // Cy.server can stub any responses from the backend
        cy.server()

        // This time, we're going to intercept the request
        // and send back our own responses without it
        // hitting the backend
        cy.route({
            method: 'POST',
            url: '/api/todos',
            status: 500,
            response: '',
        }).as('createTodo')

        cy.get('.new-todo').type('2nd Todo{enter}')

        // Locally, the todo list length is updated,
        // while the backend attempts to create the todo
        cy.get('[data-cy=todo-list]')
            .children()
            .should('have.length', 2)

        // Each time we wait for an alias, Cypress
        // will reply with that response, although
        // it will only evaluate the alias once
        cy.wait('@createTodo')

        // Let's have the backend return a 2nd 500 error
        cy.route({
            method: 'POST',
            url: '/api/todos',
            status: 500,
            response: {},
        }).as('createTodo2')

        cy.wait('@createTodo2')

        cy.route({
            method: 'POST',
            url: '/api/todos',
            status: 500,
            response: {},
        }).as('createTodo3')

        cy.wait('@createTodo3')

        // Now, we expect the todo to be removed from
        // the frontend
        cy.get('[data-cy=todo-list]')
            .children()
            .should('have.length', 1)

        cy.store().should('deep.equal', {
            todos: [{
                id: 1,
                text: 'Hello World',
                completed: false
            }],
            visibilityFilter: 'show_all'
        })

    })

    // Using Cypress to assert retries succeed eventually
    it('stubs out when request retries eventually succeed', () => {
        cy.seed([{'text': "Hello World"}])
        cy.visit("/")

        // Assert there is only one item
        cy.get('[data-cy=todo-list]')
            .children()
            .should('have.length', 1)

        cy.store().should('deep.equal', {
            todos: [{
                id: 1,
                text: 'Hello World',
                completed: false
            }],
            visibilityFilter: 'show_all'
        })

        // Cy.server can stub any responses from the backend
        cy.server()

        // This time, we're going to intercept the request
        // and send back our own responses without it
        // hitting the backend
        cy.route({
            method: 'POST',
            url: '/api/todos',
            status: 500,
            response: '',
        }).as('createTodo')

        cy.get('.new-todo').type('2nd Todo{enter}')

        // The todo is added to the frontend
        cy.get('[data-cy=todo-list]')
            .children()
            .should('have.length', 2)

        // Each time we wait for an alias, Cypress
        // will reply with that response, although
        // it will only evaluate the alias once
        cy.wait('@createTodo')

        // Let's have the backend return a 2nd 500 error
        cy.route({
            method: 'POST',
            url: '/api/todos',
            status: 500,
            response: {},
        }).as('createTodo2')

        cy.wait('@createTodo2')

        // Finally, the request succeeds using the retry
        // mechanic in Redux Saga
        cy.route({
            method: 'POST',
            url: '/api/todos',
            status: 200,
            response: {},
        }).as('createTodo3')

        cy.wait('@createTodo3')

        // The Todo is still on the frontend,
        // because it was a successful request
        cy.get('[data-cy=todo-list]')
            .children()
            .should('have.length', 2)

        cy.store().should('deep.equal', {
            todos: [{
                id: 1,
                text: 'Hello World',
                completed: false
            }, {
                id: 2,
                text: '2nd Todo',
                completed: false
            }],
            visibilityFilter: 'show_all'
        })

    })

})