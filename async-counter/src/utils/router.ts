interface RouteHandlerProps<Env = any, Params = any> {
  request: Request;
  ctx: ExecutionContext;
  env: Env;
  params: Params;
}

export type RouteHandler<Env = any, Params = any> = (
  options: RouteHandlerProps<Env, Params>
) => Response | Promise<Response>;

interface Route<Env = any, Params = any> {
  method: string;
  pattern: URLPattern;
  handler: RouteHandler<Env, Params>;
}

export const router =
  (firstRoute: Route, ...routes: Route[]) =>
  (
    request: Request,
    env: unknown,
    ctx: ExecutionContext
  ): Response | Promise<Response> => {
    for (const route of [firstRoute, ...routes]) {
      if (request.method === route.method) {
        const patternResult = route.pattern.exec(request.url);
        if (patternResult) {
          return route.handler({
            request,
            env,
            ctx,
            params: {
              ...patternResult.protocol.groups,
              ...patternResult.hostname.groups,
              ...patternResult.pathname.groups,
              ...patternResult.search.groups,
              ...patternResult.hash.groups,
              ...patternResult.username.groups,
              ...patternResult.password.groups,
            },
          });
        }
      }
    }

    return Promise.resolve(new Response(`Not found`, { status: 404 }));
  };

const routeBuilder =
  (method: string) =>
  <Env = unknown, Params = unknown>(
    pattern: string,
    handler: RouteHandler<Env, Params>
  ): Route<Env, Params> => ({
    method,
    pattern: new URLPattern({
      pathname: pattern,
    }),
    handler,
  });

export const get = routeBuilder("GET");
export const post = routeBuilder("POST");
export const put = routeBuilder("PUT");
export const del = routeBuilder("DELETE");
export const patch = routeBuilder("PATCH");
export const options = routeBuilder("OPTIONS");
export const head = routeBuilder("HEAD");
export const trace = routeBuilder("TRACE");
export const connect = routeBuilder("CONNECT");
