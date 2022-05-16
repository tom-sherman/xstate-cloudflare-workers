export const text = (body: string, init?: ResponseInit | Response) =>
  new Response(body, init);

export const json = (body: any, init?: ResponseInit | Response) => {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
};

export const html = (body: string, init?: ResponseInit | Response) => {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  return new Response(body, {
    ...init,
    headers,
  });
};
