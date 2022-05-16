import { createMachine } from "xstate";
import type { AnyState } from "xstate";
import { html, json } from "./body";
import { get, post, RouteHandler, router } from "./router";
import type { Env } from "./types";
import documentHtml from "./index.html";

const donutMachine = createMachine({
  id: "donut",
  initial: "ingredients",
  states: {
    ingredients: {
      on: {
        NEXT: "directions",
      },
    },
    directions: {
      initial: "makeDough",
      onDone: "fry",
      states: {
        makeDough: {
          on: { NEXT: "mix" },
        },
        mix: {
          type: "parallel",
          states: {
            mixDry: {
              initial: "mixing",
              states: {
                mixing: {
                  on: { MIXED_DRY: "mixed" },
                },
                mixed: {
                  type: "final",
                },
              },
            },
            mixWet: {
              initial: "mixing",
              states: {
                mixing: {
                  on: { MIXED_WET: "mixed" },
                },
                mixed: {
                  type: "final",
                },
              },
            },
          },
          onDone: "allMixed",
        },
        allMixed: {
          type: "final",
        },
      },
    },
    fry: {
      on: {
        NEXT: "flip",
      },
    },
    flip: {
      on: {
        NEXT: "dry",
      },
    },
    dry: {
      on: {
        NEXT: "glaze",
      },
    },
    glaze: {
      on: {
        NEXT: "serve",
      },
    },
    serve: {
      on: {
        ANOTHER_DONUT: "ingredients",
      },
    },
  },
});

// Crudely filters out internal xstate events such as done.foo on nested states
const getNextEvents = (state: AnyState) =>
  state.nextEvents.filter((e) => !e.startsWith("done."));

export class Donut {
  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/id") {
      return json({
        id: this.state.id,
      });
    }

    if (url.pathname === "/snapshot") {
      const state = await this.state.storage.get("state");
      const resolvedState = donutMachine.resolveState(
        (state as any) ?? donutMachine.initialState
      );
      return json({
        state: resolvedState,
        nextEvents: getNextEvents(resolvedState),
      });
    }

    if (url.pathname === "/send") {
      const eventObject = await request.json();
      const state = donutMachine.resolveState(
        ((await this.state.storage.get("state")) as any) ??
          donutMachine.initialState
      );
      const nextState = JSON.parse(
        JSON.stringify(donutMachine.transition(state, eventObject as any))
      );
      await this.state.storage.put("state", nextState);
      return json({
        message: "OK",
      });
    }

    throw new Error("Unexpected");
  }
}

const getDonutState: RouteHandler<Env, { name: string }> = async ({
  params,
  env,
  request,
}) => {
  const id = env.donuts.idFromName(params.name);

  return env.donuts.get(id).fetch(new URL("/snapshot", request.url).toString());
};

const sendEventToDonut: RouteHandler<Env, { name: string }> = async ({
  request,
  params,
  env,
}) => {
  const id = env.donuts.idFromName(params.name);
  return env.donuts.get(id).fetch(
    new Request(new URL("/send", request.url).toString(), {
      // POST is not neaded for the durable object but setting just in case the fetch API discards the body on GET requests
      method: "POST",
      body: request.body,
    })
  );
};

export default {
  fetch: router(
    get("/donut/:name", getDonutState),
    post("/donut/:name/send", sendEventToDonut),
    get("/", () => html(documentHtml))
  ),
};
