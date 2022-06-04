# XState Cloudflare Durable Objects

XState + Durable Objects = 🚀

A collection of example showing how to use and deploy XState in a Cloudflare Workers environment.

## Examples

### [Donuts](/donuts/)

A simple state machine deployed into a Durable Object. Uses only pure transitions and is implemented using `machine.transition(event)`.

### [Async Counters](/async-counter/)

Demonstrates performing async work in the machine. Uses Durable Objects built in concurrency management to queue concurrent events and prevent race conditions.

### More coming soon...

Still Todo: actors, multiple workers, type safety across workers, DO alarms...
