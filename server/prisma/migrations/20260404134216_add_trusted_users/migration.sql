-- CreateTable
CREATE TABLE "TrustedUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "trustedUserId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrustedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrustedUser_trustedUserId_fkey" FOREIGN KEY ("trustedUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TrustedUser_userId_idx" ON "TrustedUser"("userId");

-- CreateIndex
CREATE INDEX "TrustedUser_trustedUserId_idx" ON "TrustedUser"("trustedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedUser_userId_trustedUserId_key" ON "TrustedUser"("userId", "trustedUserId");
