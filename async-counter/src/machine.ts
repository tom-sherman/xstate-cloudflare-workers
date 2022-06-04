import { createMachine, actions } from "xstate";

interface Context {
  count: number;
}

type Event = {
  type: "COUNT";
};

export const counterMachine = createMachine<Context, Event>({
  id: "count",
  initial: "waiting_for_count",
  context: {
    count: 0,
  },
  states: {
    waiting_for_count: {
      tags: ["settled"],
      on: {
        COUNT: "counting_even",
      },
    },
    counting_even: {
      invoke: {
        src: () => wait(1000),
        onDone: {
          target: "waiting_for_count",
          actions: actions.assign({ count: (ctx) => (ctx as any).count + 1 }),
        },
      },
    },
  },
});

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
