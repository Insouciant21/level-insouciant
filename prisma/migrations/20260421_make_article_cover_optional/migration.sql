UPDATE "Article"
SET "cover" = NULL
WHERE trim(coalesce("cover", '')) = '';

UPDATE "ArticleRevision"
SET "cover" = NULL
WHERE trim(coalesce("cover", '')) = '';

ALTER TABLE "Article"
ALTER COLUMN "cover" DROP NOT NULL;

ALTER TABLE "ArticleRevision"
ALTER COLUMN "cover" DROP NOT NULL;
