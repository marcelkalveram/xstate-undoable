# xstate-undoable

A wrapper to augment simple xState machines (not interpreted machines) with go-back behaviour.

# Motivation/Drawbacks

While xState solved a lot of problems for me, not being able to go back in state history was a big deal-breaker. I had to extend the library to allow me to travel back in time. That's why I created this little wrapper around xState, which adds the pieces that were missing for me: going back, resetting the machine and retrieving the state machine's history.

**How is this different from [History states](https://github.com/davidkpiano/xstate#history-states)?**

History nodes allow you to transition back to the previous sub-state of a state node, but you can't go back any further in history.

**Drawbacks**

Be aware that this wrapper is stateful, storing the state machine's history in an internal array. This is contrary to what a simple non-interpreted state machine does, which is fully pure and doesn't store any internal state.

This conflicts with the way that `transition` works (which is pure) since we're augmenting its behaviour to store its result. But this was an acceptable drawback for my use case, and I may consider extending this library with a `pure` version in the future.

This also means you can't use interpreted machines with go-back behaviour, because there's no way to send a `goBack` event to the interpreted state machine yet. I might try to implement this feature at some point in the future.

# Installation

```
npm install xstate-undoable
yarn add xstate-undoable
```

# Usage

Setup your xState state machine as usual:

```
const forwardMachine = createMachine({
  id: 'forward',
  initial: 'one',
  states: {
    one: { on: { FORWARD: { target: 'two', actions: 'increment' } } },
    two: { on: { FORWARD: 'three' } },
    three: { type: 'final' }
  },
});
```

Then pass it into this wrapper:

```
import undoableStateMachine from 'xstate-undoable';

const undoable = undoableStateMachine(forwardMachine);

// moving forward
undoable.transition('one', 'FORWARD');

// go back on step
const previousState = undoable.goBack();

// => 'one'
```

## API

### `goBack()`

Goes back one step in state history

```
undoable.transition('one', 'FORWARD');
const previousState = undoable.goBack();
// => 'one'
```

### `reset()`

Sets the state machine back to its initial state

```
const initialState = undoable.reset();
// => 'one'
```

### `getHistory()`

Returns the state machine history as an array

```
const stateOne = undoable.transition(state.initial, 'FORWARD');
const stateTwo = undoable.transition(state.value, 'FORWARD');
const history = undoable.getHistory();
// => ['one', 'two']
```

# License

MIT
