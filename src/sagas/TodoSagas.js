import { takeEvery, takeLatest, put, all, select, retry } from "redux-saga/effects";
import axios from "axios";

if (window.Cypress) {
  window.axios = axios
}

function getApiUrl() {
  return window.REACT_APP_API_URL ? window.REACT_APP_API_URL : 'http://localhost:3000'
}

function* createTodo(data) {
  try {
    const response = yield retry(3, 0, attemptCreateTodo, data)
    yield put({ type: 'CREATE_TODO_SUCCESS', payload: response })
  } catch(error) {
    yield put({ ...data, type: 'ADD_TODO_FAIL' })
  }
}

export function* attemptCreateTodo(action) {
  yield axios.post(`${getApiUrl()}/api/todos`, {text: action.text, completed: false})
}

export function* fetchTodos() {
  let response = yield axios.get(`${getApiUrl()}/api/todos`)
  let todos = response.data;

  yield put({ type: "TODOS_LOADED", todos });
}

export function* destroyTodo(action) {
  let response = yield axios.delete(`${getApiUrl()}/api/todos/${action.id}`)

  // TODO: make these resilient. For sample app, we don't necessarily
  // need to. These actions are not responded to anywhere.
  //
  // Look into generators for resiliency
  if (response.status === 200) {
    yield put({ type: 'DELETE_TODO_SUCCESS' })
  } else {
    yield put({ type: 'DELETE_TODO_FAILURE' })
  }
}

export function* destroyAllTodos(action) {
  let filtered = yield select(state => state.todos.filter(todo => todo.completed))
  yield put({type: 'LOCAL_CLEAR_COMPLETED'})
  
  yield axios.post(`${getApiUrl()}/api/todos/bulk_delete`, {ids: filtered.map(f => f.id)})
}

export function* editTodo(action) {
  yield axios.put(`${getApiUrl()}/api/todos/${action.id}`, action.todo)
}

export function* completeAllTodos(action) {
  let todos = yield select(state => state.todos)
  let allAreMarked = todos.every(todo => todo.completed)
  let newTodos = todos.map((todo) => {
    return { ...todo, completed: !allAreMarked }
  })

  yield put({ type: 'BULK_EDIT_TODOS', todos: newTodos })
}

export function* bulkEditTodos(action) {
  yield axios.put(`${getApiUrl()}/api/todos/bulk_update`, {todos: action.todos})
}

export function* rootSaga() {
  yield all([
    takeLatest("FETCH_TODOS", fetchTodos),
    takeEvery("ADD_TODO", createTodo),
    takeEvery("DELETE_TODO", destroyTodo),
    takeEvery("EDIT_TODO", editTodo),
    takeLatest("CLEAR_COMPLETED", destroyAllTodos),
    takeEvery("COMPLETE_ALL_TODOS", completeAllTodos),
    takeEvery("BULK_EDIT_TODOS", bulkEditTodos),
  ])
}