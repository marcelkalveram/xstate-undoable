import cloneDeep from 'lodash/cloneDeep';

export default (machine) => {
  let history = [machine.initialState];
  const undoableMachine = cloneDeep(machine);

  // returns next state
  const transition = (state, event, context) => {
    const nextState = machine.transition(state, event, context);
    return nextState;
  };

  // iterate through history and replay each state transition
  const replayHistory = (machineHistory) =>
    machineHistory.reduce(
      (acc, cur) => [
        ...acc,
        transition(acc[acc.length - 1], cur.event.type, cur.context)
      ],
      []
    );

  undoableMachine.transition = (state, event, context) => {
    const nextState = machine.transition(state, event, context);
    history = [...history, nextState];
    return nextState;
  };

  undoableMachine.goBack = () => {
    if (history.length > 1) {
      history = replayHistory(history.slice(0, history.length - 1));
    }
    return history[history.length - 1];
  };

  undoableMachine.reset = () => {
    history = [machine.initialState];
    return history[history.length - 1];
  };

  undoableMachine.getHistory = () => history;

  return undoableMachine;
};
