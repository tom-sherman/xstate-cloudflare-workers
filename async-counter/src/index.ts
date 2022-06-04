import { createMachine, interpret } from "xstate";
import type { AnyState } from "xstate";
import { html, json } from "./utils/body";
import { get, post, RouteHandler, router } from "./utils/router";
import type { Env } from "./utils/types";
import documentHtml from "./index.html";
import { counterMachine } from "./machine";
import { waitFor } from "xstate/lib/waitFor";

// Crudely filters out internal xstate events such as done.foo on nested states
const getNextEvents = (state: AnyState) =>
  state.nextEvents.filter((e) => !e.startsWith("done."));

export class Counter {
  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/id") {
      return json({
        id: this.state.id,
      });
    }

    if (url.pathname === "/snapshot") {
      const state = await this.getState();
      return json({
        state: state,
        nextEvents: getNextEvents(state),
      });
    }

    if (url.pathname === "/send") {
      return this.state.blockConcurrencyWhile(async () => {
        const eventObject = await request.json();
        const currentState = await this.getState();

        const actor = interpret(
          counterMachine.withContext(currentState.context)
        ).start(currentState);

        actor.send(eventObject as any);

        console.log("Waiting for ", (eventObject as any).type);
        const nextState = await waitFor(actor, (state) =>
          state.tags.has("settled")
        );

        await this.state.storage.put(
          "state",
          JSON.parse(JSON.stringify(nextState))
        );
        return json({
          message: "OK",
        });
      });
    }

    throw new Error("Unexpected");
  }

  private async getState() {
    const fetchedState = await this.state.storage.get("state");
    return fetchedState
      ? counterMachine.resolveState(fetchedState as any)
      : counterMachine.initialState;
  }
}

const getCounterState: RouteHandler<Env, { name: string }> = async ({
  params,
  env,
  request,
}) => {
  const id = env.counters.idFromName(params.name);

  return env.counters
    .get(id)
    .fetch(new URL("/snapshot", request.url).toString());
};

const sendEventToCounter: RouteHandler<Env, { name: string }> = async ({
  request,
  params,
  env,
}) => {
  const id = env.counters.idFromName(params.name);
  return env.counters.get(id).fetch(
    new Request(new URL("/send", request.url).toString(), {
      // POST is not neaded for the durable object but setting just in case the fetch API discards the body on GET requests
      method: "POST",
      body: request.body,
    })
  );
};

export default {
  fetch: router(
    get("/counter/:name", getCounterState),
    post("/counter/:name/send", sendEventToCounter),
    get("/", () => html(documentHtml))
  ),
};
