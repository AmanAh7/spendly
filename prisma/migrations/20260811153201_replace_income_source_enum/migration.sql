/*
  Replace the global IncomeSource enum with user-owned IncomeSource records.

  This migration preserves all existing Income rows and maps legacy enum
  values to human-readable source names.
*/

ALTER TYPE "IncomeSource" RENAME TO "LegacyIncomeSource";

CREATE TABLE "IncomeSource" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomeSource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IncomeSource_userId_name_key"
    ON "IncomeSource"("userId", "name");

CREATE INDEX "IncomeSource_userId_isDefault_idx"
    ON "IncomeSource"("userId", "isDefault");

ALTER TABLE "IncomeSource"
    ADD CONSTRAINT "IncomeSource_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "User"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE "Income"
    ADD COLUMN "sourceId" TEXT;

CREATE TEMP TABLE "IncomeSourceBackfill" (
    "legacyValue" TEXT PRIMARY KEY,
    "displayName" TEXT NOT NULL UNIQUE
) ON COMMIT DROP;

INSERT INTO "IncomeSourceBackfill" ("legacyValue", "displayName")
VALUES
    ('SALARY', 'Salary'),
    ('FREELANCE', 'Freelance'),
    ('BUSINESS', 'Business'),
    ('INVESTMENT', 'Investment'),
    ('INTEREST', 'Interest'),
    ('RENTAL_INCOME', 'Rental Income'),
    ('GIFT', 'Gift'),
    ('OTHER', 'Other');

INSERT INTO "IncomeSource" (
    "id",
    "userId",
    "name",
    "isDefault",
    "createdAt",
    "updatedAt"
)
SELECT
    md5('migrated-income-source:' || u."id" || ':' || b."legacyValue"),
    u."id",
    b."displayName",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
CROSS JOIN "IncomeSourceBackfill" b;

UPDATE "Income" AS i
SET "sourceId" = s."id"
FROM "IncomeSource" AS s
INNER JOIN "IncomeSourceBackfill" AS b
    ON b."displayName" = s."name"
WHERE s."userId" = i."userId"
  AND b."legacyValue" = i."source"::text;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Income"
        WHERE "sourceId" IS NULL
    ) THEN
        RAISE EXCEPTION
            'Income source migration failed: one or more Income rows were not backfilled';
    END IF;
END $$;

ALTER TABLE "Income"
    ADD CONSTRAINT "Income_sourceId_fkey"
    FOREIGN KEY ("sourceId")
    REFERENCES "IncomeSource"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE "Income"
    ALTER COLUMN "sourceId" SET NOT NULL;

DROP INDEX "Income_userId_source_idx";

ALTER TABLE "Income"
    DROP COLUMN "source";

CREATE INDEX "Income_userId_sourceId_idx"
    ON "Income"("userId", "sourceId");

DROP TYPE "LegacyIncomeSource";