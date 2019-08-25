import { each, has, uniqWith, isEqual, isArray } from 'lodash';

function dispatchActions(store, actions) {
  for (const action of actions) {
    store.dispatch(action);
  }
}

function scheduleActions(store, type, log, schedule, actionsToRun) {
  if (log) {
    log('run actions', type, actionsToRun);
  }
  schedule( (actions) => {
    dispatchActions(store, actions);
  }, 0, actionsToRun);
}

export const createActionsEnhancer = 
(options = {}) => 
nextCreateStore => 
(reducer, initialState, enhancer) => {
  const { startActionType, log, schedule = setTimeout } = options;
  let actions = [];
  let isPending = !!startActionType;
  let store;

  const actionsReducer = reducer => (state, action) => {
    const result = reducer(state, action);
    each(result, (subState) => {
      if (has(subState, 'actions') && isArray(subState.actions) && subState.actions.length) {
        actions.push(...subState.actions);
        delete subState.actions;
      }
    });
    if (isPending && action.type === startActionType) {
      isPending = false;
    }
    if (!isPending && actions.length) {
      const actionsToRun = uniqWith(actions, isEqual);
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
