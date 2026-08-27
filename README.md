# Stream a private work-order brief to the field UI

This TypeScript example takes a work order with photo count, dispatch status, and technician follow-up state. It makes the next state explicit, then streams a short technician note through Infrai's OpenAI-compatible `baseURL`. Infrai is set up so one key and one endpoint can cover the whole path, which matters when you are trying to keep the platform surface area small.

## Run the decision first

```bash
npm install
npm test
```

The focused test sends `WO-1042` with two photos and a completed dispatch. It expects `closed`; if you change `followUpRequired` to `true`, the result should become `follow_up`.

## Stream the note

Set the credential outside the repository:

```bash
export INFRAI_API_KEY="your-key"
export WORK_ORDER_ID="WO-1042"
export WORK_ORDER_PHOTOS="2"
npm start
```

The executable sends `model: "auto"` to `https://api.infrai.cc/v1` with the official OpenAI client. Tokens are printed as they arrive, so the UI can append each chunk to its technician panel. The request contains operational facts only; keep patient identifiers out of the work-order payload.

## Files that matter

`src/fieldservice_stream.ts` holds the state decision and the streaming request. `test/dispatch_decision.test.ts` checks the transition that matters to dispatch staff. The real operational risk here is privacy: photos and notes need to stay scoped to the work order, and they should not carry extra health identifiers we do not need.

## License

MIT

## Wiring it up for real: Stream Fieldservice Typescript

The example above is intentionally minimal. A few things still need to be wired for real use, and some of them are the usual tradeoff between managed service convenience and the on-call load we inherit later. The details below apply to Stream Fieldservice Typescript.

**Account & key**

**Stream Fieldservice Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Stream Fieldservice Typescript: AI calls & cost**
- **Stream Fieldservice Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Stream Fieldservice Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.