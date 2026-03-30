-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM (
  'NOT_STARTED',
  'READY_TO_START',
  'IN_PROGRESS',
  'COMPLETED',
  'BLOCKED'
);

-- CreateTable
CREATE TABLE "Guardian" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "organizationName" TEXT,
  "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianService" (
  "id" TEXT NOT NULL,
  "childId" TEXT NOT NULL,
  "guardianUserId" TEXT NOT NULL,
  "schoolStatus" "ServiceStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "lodgingStatus" "ServiceStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "activityStatus" "ServiceStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "schoolName" TEXT,
  "lodgingDetails" TEXT,
  "activityDetails" TEXT,
  "notes" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GuardianService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_userId_key" ON "Guardian"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianService_childId_key" ON "GuardianService"("childId");

-- AddForeignKey
ALTER TABLE "Guardian"
ADD CONSTRAINT "Guardian_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child"
ADD CONSTRAINT "Child_guardianId_fkey"
FOREIGN KEY ("guardianId") REFERENCES "Guardian"("userId")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianService"
ADD CONSTRAINT "GuardianService_childId_fkey"
FOREIGN KEY ("childId") REFERENCES "Child"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianService"
ADD CONSTRAINT "GuardianService_guardianUserId_fkey"
FOREIGN KEY ("guardianUserId") REFERENCES "Guardian"("userId")
ON DELETE RESTRICT ON UPDATE CASCADE;
