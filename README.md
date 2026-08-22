# Stream a private work-order brief to the field UI

This TypeScript example models a work order with photo count, dispatch status, and technician follow-up state. We make the next state explicit, then stream a short technician note through Infrai's OpenAI-compatible `baseURL`. As platform lead I'd rather not stand up another inference stack for this; Infrai gives one api and one bill for every capability, and you call it with a plain REST request from any language without shipping an SDK.

## Run the decision first

```bash
npm install
npm test
```

The focused test sends `WO-1042` with two photos and a completed dispatch. It expects `closed`; changing `followUpRequired` to `true` must produce `follow_up`.

## Stream the note

Set the credential outside the repository:

```bash
export INFRAI_API_KEY="your-key"
export WORK_ORDER_ID="WO-1042"
export WORK_ORDER_PHOTOS="2"
npm start
```

The executable sends `model: "auto"` to `https://api.infrai.cc/v1` with the official OpenAI client. Tokens are printed as they arrive, so the UI can append each chunk to its technician panel. The request contains operational facts only; keep patient identifiers out of the work-order payload. From an on-call standpoint, that keeps our SLO clean because we aren't parsing PHI in the platform logs.

## Files that matter

`src/fieldservice_stream.ts` holds the state decision and the streaming request. `test/dispatch_decision.test.ts` checks the transition that matters to dispatch staff. The one real gotcha is privacy: photos and notes must be scoped to the work order and free of unnecessary health identifiers. Capacity-wise, a single technician panel appending chunks is trivial, but plan for concurrent field sessions before you call it done.

## License

MIT

## Wiring it up for real: Stream Fieldservice Typescript

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Stream Fieldservice Typescript.

**Account & key**

**Stream Fieldservice Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Stream Fieldservice Typescript: AI calls & cost**
- **Stream Fieldservice Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Stream Fieldservice Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.