# XState + Cloudflare Async Counter Example

This example demos how you can do async work such as async services or `wait` in your machine.

It works using the approach described here: [tom-sherman/serverless-xstate#pausing](https://github.com/tom-sherman/serverless-xstate/blob/446b33228efd2d0f757400573de7745abcddb76f/README.md#pausing)

Essentially we tag each state that we know can't trigger async work with "settled". Our durable object can then wait until the machine reaches a state containing that tag before returning to the client.

The above link mentions a requirement for queuing, this is elegantly solved for us by `blockConcurrencyWhile` inside of the Durable Object.
