'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lodash = require('lodash');

function dispatchActions(store, actions) {
  for (const action of actions) {
    store.dispatch(action);
  }
}

function scheduleActions(store, type, log, schedule, actions) {
  if (log) {
    log('schedule actions', type, actions);
  }
  schedule(dispatchActions, 0, store, actions);
}

const createActionsEnhancer = 
    (options = {}) => 
    nextCreateStore => 
    (reducer, initialState, enhancer) => {
  const { startActionType, log, schedule = setTimeout } = options;
  let actions = [];
  let isPending = !!startActionType;
  let store;

  const actionsReducer = reducer => (state, action) => {
    const result = reducer(state, action);
    lodash.each(result, (subState) => {
      if (lodash.has(subState, 'actions') && lodash.isArray(subState.actions) && subState.actions.length) {
        actions.push(...subState.actions);
        delete subState.actions;
      }
    });
    if (isPending && action.type === startActionType) {
      isPending = false;
    }
    if (!isPending && actions.length) {
      const actionsToRun = lodash.uniqWith(actions, lodash.isEqual);
      actions = [];
      scheduleActions(store, action.type, log, schedule, actionsToRun);
    }
    return result;
  };

  store = nextCreateStore(actionsReducer(reducer), initialState, enhancer);

  const replaceReducer = (reducer) => {
    return store.replaceReducer(actionsReducer(reducer));
  };

  return {
    ...store,
    replaceReducer,
  };
};

exports.createActionsEnhancer = createActionsEnhancer;
