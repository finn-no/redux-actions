# Redux Actions [![Build Status](https://travis-ci.org/finn-no/redux-actions.svg?branch=master)](https://travis-ci.org/finn-no/redux-actions)

Redux Actions is a tiny library designed to help write Redux action creators and reducers with less
boilerplate.

The library is fully tested, has no external dependencies, and weighs in at less than 2 KB
uncompressed. It's published in both CommonJS and ESM format, and comes with Typescript definitions.


# Getting started

First, install the library using npm or yarn:

```bash
npm install --save @finn-no/redux-actions
```

```bash
yarn add @finn-no/redux-actions
```

Then import the functions in your code:

```javascript
import { makeAction, makeReducer } from "@finn-no/redux-actions";
```

```javascript
const { makeAction, makeReducer } = require("@finn-no/redux-actions");
```

## `makeAction`

Use `makeAction(type, reducer, creator?)` to create Redux action creators. This function takes three
parameters:

- `type` (string) an identifier for this action. This must be a unique value for each action within
  your app.
- `reducer` (function or string) the [reducer](https://redux.js.org/basics/reducers) that will be
  used to handle actions with this type. Probably the most common way to handle Redux actions is to
  set a single field in the state to a value provided in the action. For this specific use case, you
  can provide a string with the name of the state field that this action should affect. An automatic
  reducer will be provided that sets the value of the specified field in the state to the value of
  `action.payload`.
- `creator` (_optional_ function) The default action creator creates objects with two fields: `type`
  and `payload`. If you want to create objects with a different format, you will need a custom
  action creator.

The function returns an action creator which is decorated with the type and reducer of the action.
The default action creator accepts one optional argument, the value of which is assigned to the
`payload` field of the action object.

## `makeReducer`

The `makeReducer(actions)` function takes one parameter: An object where the values are actions made
with `makeAction`. It returns a reducer that handles all the provided actions.


# Boilerplate reduction

The primary advantage of this library is reducing the amount of boilerplate required when writing
action creators and reducers. The following is an example of the boilerplate that this library
removes:

## Before

A common structure for apps using Redux is to have one file that defines action type constants,
another file with action creator definitions, and a third file containing definitions of reducers.
In other words it may be necessary to look at 3 different files in order to fully understand how a
given action works.

Regardless of how the code is divided among different files, the structure often looks similar to
the following:

```javascript
/*
 * Action type constants
 */
const MY_ACTION = "MY_ACTION";
const SOME_OTHER_ACTION = "SOME_OTHER_ACTION";

/*
 * Action creators
 */
export function myAction(payload) {
  return {
    type: MY_ACTION,
    payload
  };
}

export function someOtherAction() {
  return {
    type: SOME_OTHER_ACTION
  };
}

/*
 * Reducers
 */
export function reducer(state, action) {
  switch (action.type) {
    case MY_ACTION:
      return { ...state, my_value: action.payload };

    case SOME_OTHER_ACTION:
      return { ...state, some_other_toggle: !state.some_other_toggle };

    default:
      return state;
  }
}
```

## After

With Redux Actions, the definitions of action creators and reducers are kept together, and
the need to define action types separately is eliminated:

```javascript
import { makeAction, makeReducer } from "@finn-no/redux-actions";

const actions = {};

/*
 * Define actions and reducers together
 */
actions.myAction = makeAction("MY_ACTION", "my_value");
actions.someOtherAction = makeAction("SOME_OTHER_ACTION", state => ({
  ...state,
  some_other_toggle: !state.some_other_toggle
}));

export default actions;
export const reducer = makeReducer(actions);
```


# About

Redux Actions has been in use in various apps within the travel vertical on FINN.no since
2017. The open source version was released in 2019 under the MIT license.

Copyright © 2019 Schibsted
