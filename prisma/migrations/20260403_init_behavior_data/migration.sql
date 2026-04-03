-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "articleSlug" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleLike" (
    "id" TEXT NOT NULL,
    "articleSlug" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "articleSlug" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_articleSlug_createdAt_idx" ON "PageView"("articleSlug", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_viewerId_createdAt_idx" ON "PageView"("viewerId", "createdAt");

-- CreateIndex
CREATE INDEX "ArticleLike_articleSlug_createdAt_idx" ON "ArticleLike"("articleSlug", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleLike_articleSlug_viewerId_key" ON "ArticleLike"("articleSlug", "viewerId");

-- CreateIndex
CREATE INDEX "Comment_articleSlug_createdAt_idx" ON "Comment"("articleSlug", "createdAt");
