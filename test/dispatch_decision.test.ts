import assert from "node:assert/strict";
import { nextWorkOrderState } from "../src/fieldservice_stream.ts";

const closedOrder = {
  id: "WO-1042",
  photoCount: 2,
  dispatchStatus: "complete" as const,
  followUpRequired: false,
};

assert.equal(nextWorkOrderState(closedOrder), "closed");
assert.equal(
  nextWorkOrderState({ ...closedOrder, followUpRequired: true }),
  "follow_up",
);
console.log("dispatch decision test passed");
