const { combineReducers } = require('redux');
const { createActionsEnhancer } = require('../dist/bundle.js');

describe('actionEnhancer', ()=>{
  const schedule = jest.fn((func, delay, store, actions) => {
    // console.log('schedule', {func, delay, type, actions})
    func(store, actions);
  });
  const log = jest.fn(/*console.log.bind(console)*/);
  let store;
  const dispatch = jest.fn((action) => {
    // console.log('dispatch', action)
    store.state = store.reducer(store.state, action);
  });
  const nextEnhancer = {};
  const nextCreateStore = (reducer, initialState, storeEnchancer) => {
    return {
      reducer,
      dispatch,
      state: initialState,
      enhancer: storeEnchancer,
    }
  };
  const testAction = {
    type: 'TEST_ACTION',
  };
  const runAction = {
    type: 'RUN_ACTION',
  };
  const scheduleAction = {
    type: 'SCHEDULE_ACTION',
  };
  const schedule2Action = {
    type: 'SCHEDULE2_ACTION',
  };
  const scheduleEmptyAction = {
    type: 'SCHEDULE_EMPTY_ACTION',
  };
  const startAction = {
    type: 'START_ACTION',
  };

  const section = (state = {}, action) => {
    switch(action.type) {
      case 'SCHEDULE_ACTION': {
        return {
          ...state,
          actions: [ runAction ],
        };
      }
      case 'SCHEDULE2_ACTION': {
        return {
          ...state,
          actions: [ runAction, testAction ],
        };
      }
      case 'SCHEDULE_EMPTY_ACTION': {
        return {
          ...state,
          actions: [],
        };
      }
      default:
        return state;
    }
  }
  const rootReducer = combineReducers({
    section,
  });
  const initialRootState = {};

  const createStoreWithEnchancer = (options) => {
    const actionsEnhancer = createActionsEnhancer(options);
    const createStore = actionsEnhancer(nextCreateStore);
    store = createStore(rootReducer, initialRootState, nextEnhancer);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    createStoreWithEnchancer({ log, schedule });
  });

  it('should create store', ()=>{
    expect(store.replaceReducer).toBeDefined();
    expect(store.dispatch).toBe(dispatch);
    expect(store.state).toBe(initialRootState);
    expect(store.enhancer).toBe(nextEnhancer);
    expect(store.reducer).not.toBe(rootReducer);
  });
  it('should dispatch an action', ()=>{
    store.dispatch(testAction);
    expect(dispatch).toHaveBeenCalled();
    expect(schedule).not.toHaveBeenCalled();
  });
  it('should schedule an action', ()=>{
    store.dispatch(scheduleAction);
    expect(dispatch).toHaveBeenCalled();
    expect(schedule).toHaveBeenCalledWith(
      expect.any(Function),
      0,
      expect.any(Object),
      expect.arrayContaining([ runAction ]),
    );
  });
  it('should log schedule an action', ()=>{
    store.dispatch(scheduleAction);
    expect(log).toHaveBeenCalled();
  });
  it('should schedule two actions', ()=>{
    store.dispatch(schedule2Action);
    expect(dispatch).toHaveBeenCalled();
    expect(schedule).toHaveBeenCalled();
  });
  it('should log two actions', ()=>{
    store.dispatch(schedule2Action);
    expect(log).toHaveBeenCalledWith(
      expect.any(String),
      schedule2Action.type,
      expect.arrayContaining([ runAction, testAction ],
      expect.any(Function),
    ));
  });
  it('should not schedule if empty actions', ()=>{
    store.dispatch(scheduleEmptyAction);
    expect(dispatch).toHaveBeenCalledWith(scheduleEmptyAction);
    expect(schedule).not.toHaveBeenCalled();
  });
  it('should not log an action without option', ()=>{
    createStoreWithEnchancer({ schedule });
    store.dispatch(scheduleAction);
    expect(dispatch).toHaveBeenCalled();
    expect(schedule).toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
  it('should not schedule before start action', ()=>{
    createStoreWithEnchancer({ schedule, startActionType: startAction.type });
    store.dispatch(scheduleAction);
    expect(dispatch).toHaveBeenCalled();
    expect(schedule).not.toHaveBeenCalled();
  });
  it('should schedule action after the start action', ()=>{
    createStoreWithEnchancer({ schedule, startActionType: startAction.type });
    store.dispatch(scheduleAction);
    expect(schedule).not.toHaveBeenCalled();
    store.dispatch(startAction);
    expect(schedule).toHaveBeenCalledWith(
      expect.any(Function),
      0,
      expect.any(Object),
      expect.arrayContaining([ runAction ]),
    );
  });
});
