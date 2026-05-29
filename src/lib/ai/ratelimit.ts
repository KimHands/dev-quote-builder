import { prisma as defaultPrisma } from "@/lib/db";

export type Counts = { userDay: number; userMin: number; ipDay: number; globalDay: number };
export type Limits = { userDay: number; userMin: number; ipDay: number; globalDay: number };
export type Decision = { allowed: true } | { allowed: false; reason: string };

const DEFAULTS: Limits = { userDay: 10, userMin: 3, ipDay: 20, globalDay: 200 };

export function decideLimit(counts: Counts, limits: Limits): Decision {
  if (counts.globalDay >= limits.globalDay) {
    return { allowed: false, reason: "전역 일일 한도 초과 (서비스 보호를 위해 일시 중단)" };
  }
  if (counts.userDay >= limits.userDay) {
    return { allowed: false, reason: "사용자 일일 한도를 초과했습니다" };
  }
  if (counts.userMin >= limits.userMin) {
    return { allowed: false, reason: "요청이 너무 빠릅니다. 잠시 후 다시 시도해 주세요" };
  }
  if (counts.ipDay >= limits.ipDay) {
    return { allowed: false, reason: "이 IP의 일일 한도를 초과했습니다" };
  }
  return { allowed: true };
}

function parseLimit(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function readEnvLimits(): Limits {
  return {
    userDay: parseLimit(process.env.AI_LIMIT_USER_DAY, DEFAULTS.userDay),
    userMin: parseLimit(process.env.AI_LIMIT_USER_MIN, DEFAULTS.userMin),
    ipDay: parseLimit(process.env.AI_LIMIT_IP_DAY, DEFAULTS.ipDay),
    globalDay: parseLimit(process.env.AI_GLOBAL_KILL_DAY, DEFAULTS.globalDay),
  };
}

function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function countWindows(
  prisma: typeof defaultPrisma,
  userId: string,
  ip: string,
): Promise<Counts> {
  const dayStart = startOfTodayUTC();
  const minuteStart = new Date(Date.now() - 60_000);

  const [userDay, userMin, ipDay, globalDay] = await Promise.all([
    prisma.aiParse.count({ where: { userId, createdAt: { gte: dayStart } } }),
    prisma.aiParse.count({ where: { userId, createdAt: { gte: minuteStart } } }),
    prisma.aiParse.count({ where: { ip, createdAt: { gte: dayStart } } }),
    prisma.aiParse.count({ where: { createdAt: { gte: dayStart } } }),
  ]);

  return { userDay, userMin, ipDay, globalDay };
}
