# Shaded Maple
🍁 Modular [`ServiceWorker`](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API): stream to response, CDN-like local cache.

Source of the name [`here`](https://www.fimfiction.net/story/55396/) (**Shade** + Winter Maple).

## Key features
- [x] Serve [`ReadableStream`s](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) under an ephemeral path, reachable via `GET` requests.
- [ ] A local cache that functions like a CDN.
  - [ ] AppCache respun.

## Distributed versions
- `swReq.js`: Service worker for local share handling and stream-to-response conversion, as well as an AppCache manifest-driven prefetch cache (only `CACHE:` gets used, 304 checks every time). Everything else not covered gets bypassed.
- `swCdn.js`: The above, plus the full local CDN.
- `swLru.js`: The `SharedWorker` for cleaning up local CDN caches. Not needed by `swReq.js`.
- `shade.mjs`: A set of APIs used by pages to receive shares, register and manage streams, as well as supplying AppCache manifests. Also used to stream warnings and errors back to the page console.

## Technical design
### Constraints
- Hit browser's own HTTP cache as much as possible.
- One incoming request, at most one outgoing request.
- A copy of paths should be available in RAM as compressed trie.

### Path handlers
- `@/maple-file/<rdnn>?to=<targetUrl>`: ~~Handle PWA file opens locally~~ (removed).
- `@/maple-share/<rdnn>?name=&desc=&from=`: Handle PWA shares locally.
  - `<rdnn>`: ID in reverse domain name notation, registered by pages. Having this causes the page to redirect to the registered page when it's not open. The ServiceWorker will hand the files over to the target page.
- `@/maple-stream/<streamId>`: `ReadableStream` as a `GET` response, single-use by default. `HEAD` requests before the final `GET` do not cause expiration. Uses the [`Range`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Range) header with `bytes` members instead of URL parameters, however `start=` and `size=` can be used. Defaults to `application/octet-stream`.
- `@/maple-blob/<blobId>`: Reusable version of `maple-stream`, which causes `ReadableStream` to be funneled into cache. Reusable blobs will all be deleted after 900 seconds of creation, and they can be manually destroyed by their creators.

### On-device CDN
- Shaded Maple and its request interception capability (local stream, local blob, local share, local CDN) will not kick in until it is ready.
- There's no intention for Shaded Maple to be a plugin of a toolchain, as the SW part is designed to be mostly drop-and-forget.
  - Anyone is welcome to build their own toolchain to generate the AppCache manifest file. Should be much simpler than most toolchains are offering on their own.
- Most requests, will be sent to the server nonetheless to check for 304, unless Shaded Maple determines that the device is fully offline. Requests that normally don't expect many changes have different rules.
  - All responses will have a `Date` header written whenever not set.
  - Browser cache maybe prioritised over Shaded Maple by browsers themselves, so Shaded Maple itself may not cause an inflated network request count.
  - Requests hitting local caches will still be served first, the 304 checks and updates are just run in the background.
  - Requests and responses that don't typically change much will be bounded by a 5-second-minimum, 8-hour-maximum duration before 304 checks occur, customised through response headers.
    - Being either stale or expired will cause the 304 check.
    - Requests having `Sec-Fetch-Dest` being one of such values (e.g. `image`) apply.
    - Requests having `Accept` containing matching MIME (e.g. `image/*`, `audio/*`) apply.
  - Requests that are not `GET` or `HEAD` bypasses caching entirely.
  - WebSocket and SSE bypasses caching entirely.
  - Requests and responses may get affected by `Cache-Control`.
    - Responses and caches having `immutable` causes 304 checks to not trigger entirely until expiration.
    - Requests having `no-cache` bypasses local serving, but still stores. Responses and caches having `no-cache` triggers 304 checks on all requests.
    - Requests having `no-store` or `no-transform` bypasses local serving and storage. Responses and caches having `no-store` or `no-transform` don't get stored.
    - Responses or caches having `private` and `must-understand` are the same as `no-store` to allow the browser itself to take over.
    - Responses or caches having `public` are having this directive ignored to allow default Shaded Maple behaviour.
    - Responses or caches having `stale-while-revalidate` causes 304 checks to happen when its specified stale duration is reached. Prioritized over `max-age` and `s-max-age`.
    - Responses or caches having `s-max-age` causes 304 checks to happen when its specified expiration duration is reached. Prioritized over `max-age`.
    - Requests having `max-age` and `max-stale`, unless the value is `0` (same as `no-cache`), have their mentioned directives ignored for default behaviour. Responses or caches having `max-age` causes 304 checks to happen when its specified expiration duration is reached.
    - `min-fresh` and `stale-if-error` are ignored entirely for requests, as major browsers aren't seen sending or supporting them.
    - Responses or caches having `stale-if-errors` causes error responses to bypass storage, while attempt to serve a local cached version having no error status when available.
    - `only-if-cached` for requests is ignored for default Shaded Maple behaviour.
- AppCache manifests are not a requirement.
  - They are registered by pages themselves on-demand.
  - They just seed the local CDN, they aren't the final authority.
  - They are exempt from caching entirely, by `text/text/cache-manifest` or `*.manifest`.
  - Dynamic sites can use the `NETWORK:` directives for SSR pages or API requests, if they don't use `no-cache`, `no-store` or `no-transform`.
- `no-cache` and `no-store` are respected: `no-cache` bypass triggering the cache serve entirely without preventing storage, `no-store` bypasses storing. Maybe `no-transform` will also bypass Shaded Maple entirely, since Shaded Maple is transforming the request in some way.
- Shaded Maple's service worker and/or pages may control a shared worker for background cache pruning.
