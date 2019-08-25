import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';

import { createActionsEnhancer } from 'redux-reducer-actions';

import rootReducer from './root-reducer';
import rootSaga from './effects';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['app', 'sidePanel'],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

const logger = createLogger({
  collapsed: true,
});

const isDev = process.env.NODE_ENV !== 'production';

const middlewares = [];
const sagaMiddleware = createSagaMiddleware();
const actionEnchancer = createActionsEnhancer({ log: isDev ? console.log.bind(console) : null }); // eslint-disable-line no-console

middlewares.push(sagaMiddleware);
if (isDev) {
  middlewares.push(logger);
}

let enhancer = applyMiddleware(...middlewares);
if (isDev) {
  enhancer = composeWithDevTools(enhancer);
}

const store = createStore(persistedReducer,
  compose(actionEnchancer, enhancer));

const persistor = persistStore(store);
sagaMiddleware.run(rootSaga);

export default function configureStore() {
  return {
    store: {
      ...store,
      runSaga: sagaMiddleware.run,
    },
    persistor,
  };
}
