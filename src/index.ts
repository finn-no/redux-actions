// Copyright 2019 Schibsted
/**
 * Takes an action type name, a reducer, and optionally a custom action creator, and returns an
 * action creator function with the type and reducer attached.
 *
 * An map of action creators can be passed to [makeReducer()]{@link makeReducer} to automatically
 * generate a reducer that handles all the provided actions.
 *
 * The reducer argument can be either a function or a string:
 *  - If a function is provided, it should have the normal reducer signature:
 *    (state, action) => newState The function should return a new state object and should _not_
 *    modify the state argument.
 *  - If a string is provided instead, a simple single-value reducer will be generated
 *    automatically. The automatic reducer returns a new state where the property with the provided
 *    name is set to the value of the payload property on the action object.
 *
 * The default action creator function will return an action that takes one optional argument: The
 * value of the `payload` field.
 *
 * @param {String} type The action type label
 * @param {Function|String} reducer A reducer function, or the name of a field in the state that
 *        this action will affect
 * @param {Function} [creator] An action creation function
 * @return {Function} An action creation function
 * @see {@link makeReducer}
 */
export function makeAction(
  type: string,
  reducer: string | ActionReducer,
  creator?: ActionCreator
): DecoratedActionCreator {
  if (type === undefined || reducer === undefined) {
    throw new Error("makeAction requires a type and a reducer");
  }

  const reducerFn: ActionReducer =
    typeof reducer === "string" ? defaultReducer.bind(null, type, reducer) : reducer;
  const creatorFn: ActionCreator =
    typeof creator === "function" ? creator : defaultCreator.bind(null, type);

  return Object.assign(creatorFn.bind(null), { type, reducer: reducerFn });
}

function defaultReducer(
  type: string,
  field: string,
  state: ReduxState,
  action: ReduxAction
): ReduxState {
  if (action.type === type) {
    return {
      ...state,
      [field]: action.payload
    };
  } else {
    return state;
  }
}

function defaultCreator(type: string, payload: ActionPayload): ReduxAction {
  return { type, payload };
}

/**
 * Takes an object consisting of action definitions as defined by [makeAction()]{@link makeAction},
 * and returns a reducer function that handles all the provided actions.

 * @param {ActionsObject} actions An object where the values are actions made with
 *        [makeAction()]{@link makeAction}
 * @returns {ReduxReducer}
 * @see {@link makeAction}
 */
export function makeReducer(actions: ActionsObject): ReduxReducer {
  if (typeof actions !== "object") {
    throw new Error("Failed to make reducer: No actions specified");
  }

  const reducerActions: CombinedReducerActions = Object.keys(actions)
    .filter(name => !!actions[name].reducer && !!actions[name].type)
    .reduce((last, name) => ({ ...last, [name]: actions[name] }), {});

  function reducer(state: ReduxState, action: ReduxAction): ReduxState {
    if (!state || typeof state !== "object") {
      throw new Error("Failed to execute reducer: Missing state");
    } else if (!action || typeof action !== "object" || !action.type) {
      throw new Error("Failed to execute reducer: Missing or invalid action");
    }

    const actionNames = Object.keys(reducerActions).filter(
      actionName => actions[actionName].type === action.type
    );

    if (actionNames.length === 1) {
      return reducerActions[actionNames[0]].reducer(state, action);
    } else if (actionNames.length === 0) {
      return state;
    } else {
      throw new Error(
        `Cannot execute reducer for action type "${action.type}" - multiple matching reducers found`
      );
    }
  }
  reducer.actions = Object.keys(reducerActions);
  return reducer;
}

/**
 * A Redux action creator function
 * @returns {Object} A Redux action object with a type and, optionally, a payload.
 */
export interface ActionCreator {
  (type: string, payload?: any): ReduxAction;
}

/**
 * An action creator function with two additional properties attached: `type`, and `reducer`.
 */
export interface DecoratedActionCreator {
  (payload?: any): ReduxAction;
  type: string;
  reducer: ActionReducer;
}

/**
 * An object where the values are DecoratedActionCreator functions made with makeAction()
 */
export interface ActionsObject {
  readonly [actionName: string]: DecoratedActionCreator;
}

/**
 * A Redux reducer function which takes a state and an action, and returns a new state.
 */
export interface ActionReducer {
  (state: ReduxState, action: ReduxAction): ReduxState;
}

export type ActionPayload = string | number | boolean;

export interface ReduxState {
  readonly [key: string]: any;
}

export interface ReduxAction {
  readonly type: string;
  readonly payload?: any;
}

export interface ReduxReducer {
  (state: ReduxState, action: ReduxAction): ReduxState;
}

export interface CombinedReducerActions {
  readonly [actionName: string]: DecoratedActionCreator;
}
