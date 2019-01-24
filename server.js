// Everything here is default json-server code (https://github.com/typicode/json-server).
// 
// This allows us to use a super simple database (just the file db.json),
// and the rewriter method allows us to map all expected REST commands
// (e.g. get /api/todos) to 
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

server.post('/api/todos/bulk_delete', ({body: { ids }}, res) => {
  let todos = router.db.get('todos').filter(todo => !ids.includes(todo.id) ).value()
  router.db.setState({ todos })
  res.sendStatus(200)
})

server.put('/api/todos/bulk_update', ({body: { todos }}, res) => {
  todos.forEach((todo) => {
    router.db.get('todos').find({id: todo.id}).assign(todo).write()
  })
  res.sendStatus(200)
})

server.use(jsonServer.rewriter({
  '/api/*': '/$1'
}))

server.use(router)

const listener = server.listen(3000, () => {
  console.log(`JSON Server is running at port ${listener.address().port}`)
})