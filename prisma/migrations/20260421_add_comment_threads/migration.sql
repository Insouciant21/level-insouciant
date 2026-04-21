ALTER TABLE "Comment"
ADD COLUMN "parentId" TEXT;

CREATE INDEX "Comment_articleSlug_parentId_createdAt_idx"
ON "Comment"("articleSlug", "parentId", "createdAt");

CREATE INDEX "Comment_parentId_createdAt_idx"
ON "Comment"("parentId", "createdAt");

ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
