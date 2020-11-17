import { assert } from 'chai';
import { createMachine, assign } from 'xstate';
import undoableMachine from '../src';

const increment = assign({
  amount: context => context.amount + 1
});

const forwardMachine = createMachine({
  id: 'forward',
  initial: 'one',
  states: {
    one: { on: { FORWARD: { target: 'two', actions: 'increment' } } },
    two: { on: { FORWARD: 'three' } },
    three: { type: 'final' }
  },
  context: {
    amount: 0
  }

}, {
  actions: { increment }
});

describe('Undoable machine tests', () => {
  it('should go back one step', () => {
    const undoable = undoableMachine(forwardMachine);
    undoable.transition(undoable.value, 'FORWARD');
    const state = undoable.goBack();
    assert.equal(state.value, 'one');
  });

  it('should go back two steps', () => {
    const undoable = undoableMachine(forwardMachine);
    undoable.transition(undoable.value, 'FORWARD');
    undoable.transition(undoable.value, 'FORWARD');
    undoable.goBack();
    const state = undoable.goBack();
    assert.equal(state.value, 'one');
  });

  it('should preserve context history', () => {
    const undoable = undoableMachine(forwardMachine);
    undoable.transition(undoable.value, 'FORWARD');
    const state = undoable.goBack();
    assert.equal(state.context.amount, 0);
  });

  it('should reset the state machine', () => {
    const undoable = undoableMachine(forwardMachine);
    undoable.transition('one', 'FORWARD');
    undoable.transition('two', 'FORWARD');
    const state = undoable.reset();
    assert.equal(state.value, 'one');
  });

  it('should return the state machine history', () => {
    const undoable = undoableMachine(forwardMachine);
    undoable.transition('one', 'FORWARD');
    const history = undoable.getHistory();
    assert.equal(history.length, 2);
    assert.equal(history[0].value, 'one');
    assert.equal(history[1].value, 'two');
  });
});
