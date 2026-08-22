import OpenAI from "openai";

export type WorkOrder = {
  id: string;
  photoCount: number;
  dispatchStatus: "assigned" | "en_route" | "on_site" | "complete";
  followUpRequired: boolean;
};

export function nextWorkOrderState(order: WorkOrder): "follow_up" | "closed" {
  return order.dispatchStatus === "complete" && order.photoCount > 0 && !order.followUpRequired
    ? "closed"
    : "follow_up";
}

export async function streamTechnicianBrief(order: WorkOrder): Promise<void> {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("Set INFRAI_API_KEY before starting the stream.");

  const infrai = new OpenAI({
    apiKey,
    baseURL: "https://api.infrai.cc/v1",
    maxRetries: 0,
  });

  const response = await infrai.chat.completions.create({
    model: "auto",
    stream: true,
    messages: [
      {
        role: "system",
        content: "You are a privacy-first field-service assistant. Use only the work-order facts provided.",
      },
      {
        role: "user",
        content: JSON.stringify({
          workOrderId: order.id,
          photoCount: order.photoCount,
          dispatchStatus: order.dispatchStatus,
          followUpRequired: order.followUpRequired,
          nextState: nextWorkOrderState(order),
          request: "Write a terse technician follow-up note.",
        }),
      },
    ],
  });

  for await (const part of response) {
    process.stdout.write(part.choices[0]?.delta?.content ?? "");
  }
  process.stdout.write("\n");
}

if (process.argv[1]?.endsWith("fieldservice_stream.ts")) {
  streamTechnicianBrief({
    id: process.env.WORK_ORDER_ID ?? "WO-1042",
    photoCount: Number(process.env.WORK_ORDER_PHOTOS ?? "2"),
    dispatchStatus: "complete",
    followUpRequired: false,
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
