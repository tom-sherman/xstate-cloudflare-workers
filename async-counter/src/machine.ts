import { createMachine, actions } from "xstate";

interface Context {
  count: number;
}

type Event =
  | {
      type: "INCREMENT";
    }
  | {
      type: "DECREMENT";
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
        INCREMENT: "incrementing",
        DECREMENT: "decrementing",
      },
    },
    incrementing: {
      invoke: {
        src: () => wait(1000),
        onDone: {
          target: "waiting_for_count",
          actions: actions.assign({ count: (ctx) => (ctx as any).count + 1 }),
        },
      },
    },
    decrementing: {
      invoke: {
        src: () => wait(500),
        onDone: {
          target: "waiting_for_count",
          actions: actions.assign({ count: (ctx) => (ctx as any).count - 1 }),
        },
      },
    },
  },
});

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
