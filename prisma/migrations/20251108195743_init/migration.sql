-- CreateTable
CREATE TABLE "health_checks" (
    "id" SERIAL NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "details" JSONB,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);
