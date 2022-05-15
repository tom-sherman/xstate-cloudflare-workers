# XState Cloudflare Durable Objects

XState + Durable Objects = 🚀

This is a port of [davidkpiano/durable-entities-xstate](https://github.com/davidkpiano/durable-entities-xstate) using Cloudflare's [Durable Objects](https://developers.cloudflare.com/workers/learning/using-durable-objects/).

## Quick Start

1. `npm install`
2. `npm start` to run locally using Wrangler

## Interacting with the State Machine

Similar the original Durable Entities demo, the `Donut` Durable Object is controlled by the following statechart:

<a href="https://xstate.js.org/viz/?gist=529435f997b4276799778db37f64b0da" title="View this statechart on XState Viz">
  <img src="https://imgur.com/PRh0nO3.jpg" />
</a>

[View this statechart on XState Viz](https://xstate.js.org/viz/?gist=529435f997b4276799778db37f64b0da)

### Interactive Demo

This demo has a simple React app that you can use to interact with the Durable Object. After starting the development server just visit http://localhost:8787/ in the browser.

### API

**To send an event to an object:**

Open up an API client, such as [Postman](https://postman.com), and `POST` a JSON event object, which is an object that contains a `{ "type": "someEventType" }` property, to `http://localhost:8787/donut/<DONUT NAME>/send`:

```
POST http://localhost:8787/donut/donut1/send

{
  "type": "NEXT"
}
```

Or using `curl`:

```bash
curl -d '{"type": "NEXT"}' -H "Content-Type: application/json" -X POST http://localhost:8787/donut/donut1/send
```

The text response should be similar to:

> `{ "message": "Event "NEXT" sent to entity "donut1"."}`

**To view the state of an object:**

In the same API client, send a `GET` request to `http://localhost:8787/donut/<DONUT NAME>`

```
GET http://localhost:8787/donut/donut1
```

Or using `curl`:

```bash
curl http://localhost:8787/donut/donut1
```

Example response:

```json
{
  "state": {
    ...
    "value": {
      "directions": "makeDough"
    },
    ...
    "event": {
      "type": "NEXT"
    },
    ...
  },
  "nextEvents": [...]
}
```
