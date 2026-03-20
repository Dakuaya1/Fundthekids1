CREATE TABLE "AdminAiReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "report" JSONB NOT NULL,

    CONSTRAINT "AdminAiReport_pkey" PRIMARY KEY ("id")
);
