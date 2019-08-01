// Copyright 2019 Schibsted
import { makeAction } from "..";
import deepFreeze from "deep-freeze";

const noop = () => {};

it("should return a function", () => {
  expect(makeAction("IMPRESSIVE", noop)).toBeInstanceOf(Function);
});

it("should require a type", () => {
  expect(() => makeAction()).toThrow();
});

it("should require a reducer", () => {
  expect(() => makeAction("test")).toThrow();
});

it("should set the .type property", () => {
  expect(makeAction("WOW_WHAT_AN_ACTION", "reducer").type).toBe("WOW_WHAT_AN_ACTION");
});

describe("default action creators", () => {
  const type = "SWEET_ACTION";
  let actionCreator;

  beforeEach(() => {
    actionCreator = makeAction(type, noop);
  });

  it("should produce actions", () => {
    const action = actionCreator();

    expect(action).toEqual({ type });
  });
});

describe("with a string as reducer", () => {
  const type = "TEST_ACTION";
  const reducer = "fieldName";
  let actionCreator;
  let oldState;

  beforeEach(() => {
    actionCreator = makeAction(type, reducer);
    oldState = { test: true };
    deepFreeze(oldState);
  });

  it("should add the payload to the named field in the state", () => {
    const action = actionCreator("value");
    expect(actionCreator.reducer(oldState, action)).toEqual({
      test: true,
      fieldName: "value"
    });
  });

  it("should clear the field when no payload is provided", () => {
    const action = actionCreator();
    expect(actionCreator.reducer({ test: true, fieldName: "yes" }, action)).toEqual({ test: true });
  });

  it("should overwrite the field with the new payload", () => {
    const action = actionCreator("no");
    expect(actionCreator.reducer(oldState, action)).toEqual({
      test: true,
      fieldName: "no"
    });
  });

  it("should support boolean payloads", () => {
    const trueAction = actionCreator(true);
    expect(actionCreator.reducer(oldState, trueAction)).toEqual({
      test: true,
      fieldName: true
    });

    const falseAction = actionCreator(false);
    expect(actionCreator.reducer(oldState, falseAction)).toEqual({
      test: true,
      fieldName: false
    });
  });

  it("should support array payloads", () => {
    const emptyArrayAction = actionCreator([]);
    expect(actionCreator.reducer(oldState, emptyArrayAction)).toEqual({
      test: true,
      fieldName: []
    });

    const arrayAction = actionCreator([1, 2, 3]);
    expect(actionCreator.reducer(oldState, arrayAction)).toEqual({
      test: true,
      fieldName: [1, 2, 3]
    });

    const nestedArray = [1, [2, 3], 4, [5, [6, 7], 8]];
    const nestedArrayAction = actionCreator(nestedArray);
    expect(actionCreator.reducer(oldState, nestedArrayAction)).toEqual({
      test: true,
      fieldName: nestedArray
    });
  });

  it("should should support object payloads", () => {
    const objectPayload = { foo: true, bar: false };
    const objectAction = actionCreator(objectPayload);
    expect(actionCreator.reducer(oldState, objectAction)).toEqual({
      test: true,
      fieldName: objectPayload
    });

    const emptyObjectAction = actionCreator({});
    expect(actionCreator.reducer(oldState, emptyObjectAction)).toEqual({
      test: true,
      fieldName: {}
    });

    const nestedObject = { list: [1, 2, 3], test: { foo: "bar" } };
    const nestedObjectAction = actionCreator(nestedObject);
    expect(actionCreator.reducer(oldState, nestedObjectAction)).toEqual({
      test: true,
      fieldName: nestedObject
    });
  });

  it("should return the original state when receiving an unknown action", () => {
    expect(
      actionCreator.reducer(oldState, {
        type: "OMG_WTF",
        payload: ["dis", { is: "fun" }]
      })
    ).toEqual(oldState);
  });
});

describe("with a custom reducer", () => {
  const reducer = jest.fn();
  const payload = { test: true };
  let actionCreator;
  let action;

  beforeEach(() => {
    actionCreator = makeAction("MY_TEST_ACTION", reducer);
    action = actionCreator(payload);
  });

  it("should call the correct reducer function", () => {
    expect(reducer.mock.calls.length).toEqual(0);
    actionCreator.reducer({ otherTest: true }, action);
    expect(reducer.mock.calls.length).toEqual(1);
  });
});

describe("with a custom action creator", () => {
  const reducer = (state, action) => Object.assign({}, state, action.myActionData);
  const creator = myActionData => ({ type: "O_O", myActionData });
  const actionCreator = makeAction("TEST", reducer, creator);

  it("should create custom actions", () => {
    expect(actionCreator()).toEqual({ type: "O_O" });
  });

  it("should treat arguments correctly", () => {
    expect(actionCreator("some data")).toEqual({
      type: "O_O",
      myActionData: "some data"
    });
  });

  it("should properly merge the state when reducing", () => {
    const action = actionCreator({ foo: "bar" });
    expect(actionCreator.reducer({ test: true }, action)).toEqual({
      test: true,
      foo: "bar"
    });
  });
});
