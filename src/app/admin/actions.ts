"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assertAdmin } from "@/lib/authz";
import { isValidStatus } from "@/lib/quote/status";
import { prisma } from "@/lib/db";

export async function updateStatus(id: string, status: string) {
  const session = await auth();
  assertAdmin(session);
  if (!isValidStatus(status)) throw new Error("invalid status");
  await prisma.quote.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
}
