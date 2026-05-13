# Shaded Maple
🍁 Modular [`ServiceWorker`](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API): stream to response, CDN-like local cache.

Source of the name [`here`](https://www.fimfiction.net/story/55396/) (**Shade** + Winter Maple).

## Key features
- [x] Serve [`ReadableStream`s](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) under an ephemeral path, reachable via `GET` requests.
  - Does not respect any client headers!
- [ ] A local cache that functions like a CDN.