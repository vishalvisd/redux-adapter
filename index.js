import { createStore as cS } from "redux";
var reduxInitActionType = "@@redux/INIT";
var fulxInit = "INIT";
let reduxStore = null;
if (window.reduxDispatchMap === undefined) {
  window.reduxDispatchMap = {};
}

/*eslint-disable no-param-reassign*/
function createReducerFunctionFromConfig(config){
  let reducerFunction = (state, action)=>{
    let actionHandler = config[action.type];
    if (!actionHandler && action.type === reduxInitActionType) {
      actionHandler = config[fulxInit];
      state = {};
    }
    if (actionHandler !== undefined && typeof actionHandler === "function") {
      if (action.args){
        actionHandler(state, ...action.args);
      } else {
        actionHandler(state);
      }
      return state;
    }
  };
  return reducerFunction;
}

let createStore = function(configObj){
  reduxStore = cS(createReducerFunctionFromConfig(configObj));
  Object.keys(configObj).forEach((v) => {
    window.reduxDispatchMap[v] = reduxStore;
  });
  let storeDispatch = reduxStore.dispatch;
  reduxStore.dispatch = (...args)=>{
    storeDispatch({type: args[0], args: args.slice(1, args.length)});
  };
  reduxStore.onChange = reduxStore.subscribe;
  let veteranGetState = reduxStore.getState;
  reduxStore.getState = (noClone)=>{
    if (noClone === true){
      return veteranGetState();
    } else {
      return JSON.parse(JSON.stringify(veteranGetState()));
    }
  };
  return reduxStore;
};

let dispatcher = {
  publish: (...args) => {
    if (window.reduxDispatchMap) {
      let store = window.reduxDispatchMap[args[0]];
      if (store) {
        store.dispatch(...args);
      } else if (window.globalEventDispatchMap && window.globalEventDispatchMap[args[0]]){
        window.globalEventDispatchMap[args[0]](...args);
      } else {
        console.log("Unknown event dispatched");
      }
    }
  },
  subscribe: (action, callback) => {
    if (window.globalEventDispatchMap === undefined){
      window.globalEventDispatchMap = {};
    }
    window.globalEventDispatchMap[action] = callback;
  }
};

export {
  createStore,
  dispatcher
};
