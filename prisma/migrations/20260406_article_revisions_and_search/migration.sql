CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "Article"
ADD COLUMN "lastEditedByUserId" TEXT,
ADD COLUMN "searchDocument" TEXT NOT NULL DEFAULT '';

CREATE TABLE "ArticleRevision" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL,
    "cover" TEXT NOT NULL,
    "draft" BOOLEAN NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "ArticleRevision_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ArticleRevision_articleId_createdAt_idx" ON "ArticleRevision"("articleId", "createdAt");

CREATE INDEX "ArticleRevision_createdByUserId_createdAt_idx" ON "ArticleRevision"("createdByUserId", "createdAt");

ALTER TABLE "Article"
ADD CONSTRAINT "Article_lastEditedByUserId_fkey"
FOREIGN KEY ("lastEditedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ArticleRevision"
ADD CONSTRAINT "ArticleRevision_articleId_fkey"
FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArticleRevision"
ADD CONSTRAINT "ArticleRevision_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "Article"
SET "searchDocument" =
  coalesce("title", '') || ' ' ||
  coalesce("desc", '') || ' ' ||
  coalesce("category", '') || ' ' ||
  coalesce(array_to_string("tags", ' '), '') || ' ' ||
  coalesce("content", '');

CREATE INDEX "Article_search_fts_idx" ON "Article" USING GIN (
  to_tsvector('simple', "searchDocument")
);

CREATE INDEX "Article_search_trgm_idx" ON "Article" USING GIN ("searchDocument" gin_trgm_ops);
