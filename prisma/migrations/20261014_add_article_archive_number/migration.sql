-- BIGSERIAL allocates unique numbers for existing and future articles, including
-- inserts from older application versions and the article import script.
ALTER TABLE "Article" ADD COLUMN "archiveNumber" BIGSERIAL NOT NULL;
CREATE UNIQUE INDEX "Article_archiveNumber_key" ON "Article"("archiveNumber");
