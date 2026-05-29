-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shareId" TEXT NOT NULL,
    "userId" TEXT,
    "selections" JSONB NOT NULL,
    "tier" TEXT NOT NULL,
    "consultNeeded" BOOLEAN NOT NULL DEFAULT false,
    "budgetLow" INTEGER,
    "budgetHigh" INTEGER,
    "contactName" TEXT NOT NULL,
    "contactValue" TEXT NOT NULL,
    "contactChannel" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "lostReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_shareId_key" ON "Quote"("shareId");
