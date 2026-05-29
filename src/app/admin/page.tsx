import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { LeadRow } from "@/components/LeadRow";

export default async function AdminPage() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/");

  const leads = await prisma.quote.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <span className="seclabel">
        <span className="dot" />
        admin · 리드 {leads.length}건
      </span>
      <h1>리드 관리</h1>
      <div>
        {leads.map((l) => (
          <LeadRow
            key={l.id}
            lead={{
              id: l.id,
              shareId: l.shareId,
              contactName: l.contactName,
              contactChannel: l.contactChannel,
              contactValue: l.contactValue,
              tier: l.tier,
              consultNeeded: l.consultNeeded,
              budgetLow: l.budgetLow,
              budgetHigh: l.budgetHigh,
              status: l.status,
              createdAt: l.createdAt.toISOString(),
            }}
          />
        ))}
      </div>
    </main>
  );
}
