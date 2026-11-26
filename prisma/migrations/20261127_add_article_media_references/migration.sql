CREATE TABLE "ArticleMediaReference" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "contentReferenceCount" INTEGER NOT NULL DEFAULT 0,
    "coverReference" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleMediaReference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ArticleMediaReference_articleId_mediaAssetId_key" ON "ArticleMediaReference"("articleId", "mediaAssetId");

CREATE INDEX "ArticleMediaReference_mediaAssetId_idx" ON "ArticleMediaReference"("mediaAssetId");

CREATE INDEX "ArticleMediaReference_articleId_idx" ON "ArticleMediaReference"("articleId");

ALTER TABLE "ArticleMediaReference" ADD CONSTRAINT "ArticleMediaReference_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArticleMediaReference" ADD CONSTRAINT "ArticleMediaReference_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ArticleMediaReference" (
    "id",
    "articleId",
    "mediaAssetId",
    "contentReferenceCount",
    "coverReference",
    "createdAt",
    "updatedAt"
)
SELECT
    'amr_' || md5(a."id" || ':' || m."id"),
    a."id",
    m."id",
    CASE
        WHEN LENGTH(RTRIM(TRIM(m."publicUrl"), '/')) > 0 THEN
            (LENGTH(a."content") - LENGTH(REPLACE(a."content", RTRIM(TRIM(m."publicUrl"), '/'), '')))
            / LENGTH(RTRIM(TRIM(m."publicUrl"), '/'))
        ELSE 0
    END AS "contentReferenceCount",
    (a."cover" IS NOT NULL AND RTRIM(TRIM(a."cover"), '/') = RTRIM(TRIM(m."publicUrl"), '/')) AS "coverReference",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Article" a
INNER JOIN "MediaAsset" m
    ON (
        (a."cover" IS NOT NULL AND RTRIM(TRIM(a."cover"), '/') = RTRIM(TRIM(m."publicUrl"), '/'))
        OR (
            LENGTH(RTRIM(TRIM(m."publicUrl"), '/')) > 0
            AND POSITION(RTRIM(TRIM(m."publicUrl"), '/') IN a."content") > 0
        )
    )
ON CONFLICT ("articleId", "mediaAssetId") DO NOTHING;
