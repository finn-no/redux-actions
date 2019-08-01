// Copyright 2019 Schibsted
import { makeAction, makeReducer } from "..";

describe("makeReducer", () => {
  it("returns a function", () => {
    expect(makeReducer({})).toBeInstanceOf(Function);
  });

  it("throws when no action object is specified", () => {
    expect(() => makeReducer()).toThrow();
  });

  describe("without actions", () => {
    const reducer = makeReducer({});

    it("throws when no state is provided", () => {
      expect(() => reducer()).toThrow();
    });

    it("throws when an invalid state is provided", () => {
      expect(() => reducer("state", { type: "ACTION" })).toThrow();
    });

    it("throws when no action is provided", () => {
      expect(() => reducer({})).toThrow();
    });

    it("throws when an invalid action is provided", () => {
      expect(() => reducer({}, "ACTION!")).toThrow();
    });

    it("throws when the action has no type", () => {
      expect(() => reducer({}, { noType: "MISSING" })).toThrow();
    });
  });

  describe("with reducible actions from makeAction()", () => {
    let reducer;
    let actions;

    beforeEach(() => {
      actions = {
        a: makeAction("A", jest.fn(), jest.fn()),
        b: makeAction("B", jest.fn(), jest.fn())
      };

      reducer = makeReducer(actions);
    });

    it("calls the reducer of the matching action", () => {
      expect(actions.a.reducer.mock.calls.length).toEqual(0);
      expect(actions.b.reducer.mock.calls.length).toEqual(0);
      reducer({}, { type: "A" });
      expect(actions.a.reducer.mock.calls.length).toEqual(1);
      expect(actions.b.reducer.mock.calls.length).toEqual(0);
    });

    it("throws when there are multiple reducers for the same action type", () => {
      actions.b.type = "A";

      expect(actions.a.reducer.mock.calls.length).toEqual(0);
      expect(actions.b.reducer.mock.calls.length).toEqual(0);
      expect(() => reducer({}, { type: "A" })).toThrow();
      expect(actions.a.reducer.mock.calls.length).toEqual(0);
      expect(actions.b.reducer.mock.calls.length).toEqual(0);
    });

    it("returns the original state when it recieves an unrecognized action", () => {
      expect(reducer({ state: true }, { type: "WEIRD_ACTION_LOL", payload: "yes" })).toEqual({
        state: true
      });
    });

    describe("and plain action creators", () => {
      beforeEach(() => {
        actions.c = () => ({ type: "MY_PLAIN_ACTION" });
        actions.d = payload => ({
          type: "MY_PLAIN_ACTION_WITH_PAYLOAD",
          payload
        });
        actions.e = payload => dispatch => {
          dispatch({ type: "BOOP", payload });
        }; // Thunky

        reducer = makeReducer(actions);
      });

      it("filters out the plain action creators", () => {
        expect(reducer.actions).toEqual(["a", "b"]);
      });
    });
  });
});
