import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import * as createLogger from 'redux-logger'
import thunk from 'redux-thunk'
import { INITIAL_STATE } from '../reducers/menu'

export default function configureStore(initialState?) {
  const logger = createLogger()
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(logger, thunk)
   )
  return store
}