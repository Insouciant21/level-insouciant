ALTER TABLE "User"
ADD COLUMN "avatarUrl" TEXT;

ALTER TABLE "Comment"
ADD COLUMN "userId" TEXT;

ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Comment_userId_createdAt_idx" ON "Comment"("userId", "createdAt");

UPDATE "Comment" AS c
SET "userId" = u."id"
FROM "User" AS u
WHERE c."userId" IS NULL
  AND (
    c."authorName" = u."email"
    OR c."authorName" = COALESCE(NULLIF(u."name", ''), u."email")
  );
