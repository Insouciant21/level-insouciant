CREATE TYPE "AgentAccess" AS ENUM ('READ', 'DRAFT', 'PUBLISH');

CREATE TABLE "AgentToken" (
    "id" TEXT PRIMARY KEY,
    "ownerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "name" TEXT NOT NULL,
    "digest" TEXT NOT NULL UNIQUE,
    "access" "AgentAccess" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3)
);
CREATE INDEX "AgentToken_ownerId_createdAt_idx" ON "AgentToken" ("ownerId", "createdAt");

ALTER TABLE "Article" ADD COLUMN "version" UUID NOT NULL DEFAULT gen_random_uuid();
CREATE FUNCTION rotate_article_version() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW."version" := gen_random_uuid();
    RETURN NEW;
END;
$$;
CREATE TRIGGER article_version_on_update BEFORE UPDATE ON "Article"
FOR EACH ROW EXECUTE FUNCTION rotate_article_version();
