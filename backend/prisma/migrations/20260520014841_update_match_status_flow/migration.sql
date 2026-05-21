/*
  Warnings:

  - The values [FINISHED] on the enum `MatchStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MatchStatus_new" AS ENUM ('SCHEDULED', 'SCALE_ACCEPTED', 'IN_PROGRESS', 'CONTROL_DONE', 'CANCELED');
ALTER TABLE "public"."Match" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Match" ALTER COLUMN "status" TYPE "MatchStatus_new" USING ("status"::text::"MatchStatus_new");
ALTER TYPE "MatchStatus" RENAME TO "MatchStatus_old";
ALTER TYPE "MatchStatus_new" RENAME TO "MatchStatus";
DROP TYPE "public"."MatchStatus_old";
ALTER TABLE "Match" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
COMMIT;
