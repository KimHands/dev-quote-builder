import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { mindlogic, AI_MODEL, SYSTEM_PROMPT } from "@/lib/ai/client";
import { readEnvLimits, countWindows, decideLimit } from "@/lib/ai/ratelimit";

function inputCap(): number {
  return Number(process.env.AI_INPUT_CHAR_CAP) || 1000;
}

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const schema = z.object({ input: z.string().min(1).max(inputCap()) });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid input" }, { status: 400 });
  }
  const { input } = parsed.data;

  const ip = clientIp(request);

  const limits = readEnvLimits();
  const counts = await countWindows(prisma, userId, ip);
  const decision = decideLimit(counts, limits);
  if (!decision.allowed) {
    return Response.json({ error: decision.reason }, { status: 429 });
  }

  let completion: AsyncIterable<{ choices?: { delta?: { content?: string } }[] }>;
  try {
    completion = (await mindlogic().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: input },
      ],
      max_tokens: Number(process.env.AI_OUTPUT_MAX_TOKENS) || 1500,
      stream: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;
  } catch {
    return Response.json({ error: "잠시 후 다시 시도해 주세요" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let fullText = "";
      for await (const chunk of completion) {
        const delta = chunk.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          fullText += delta;
          controller.enqueue(encoder.encode(delta));
        }
      }
      await prisma.aiParse.create({ data: { userId, ip, input, output: fullText } });
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
