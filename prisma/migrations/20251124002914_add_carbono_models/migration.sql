-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('REDD_PLUS', 'REFORESTATION', 'RENEWABLE_ENERGY', 'REGENERATIVE_AGRICULTURE', 'COMMUNITY_CONSERVATION');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'APPROVED', 'CERTIFIED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('NEW', 'INVESTIGATING', 'RESOLVED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProjectType" NOT NULL,
    "description" TEXT,
    "geometry" JSONB NOT NULL,
    "areaHectares" DECIMAL(65,30) NOT NULL,
    "estimatedCo2TonsYear" DECIMAL(65,30),
    "department" TEXT NOT NULL,
    "municipality" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
    "organizationId" TEXT NOT NULL,
    "communities" TEXT,
    "coBenefits" TEXT,
    "startDate" TIMESTAMP(3),
    "durationYears" INTEGER,
    "geeVerified" BOOLEAN NOT NULL DEFAULT false,
    "geeLastCheck" TIMESTAMP(3),
    "forestCoveragePercent" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_status_history" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fromStatus" "ProjectStatus",
    "toStatus" "ProjectStatus" NOT NULL,
    "changedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carbon_credits" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tonsCo2" DECIMAL(65,30) NOT NULL,
    "verificationDate" TIMESTAMP(3),
    "certificationBody" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pricePerTon" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carbon_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deforestation_alerts" (
    "id" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "confidence" INTEGER NOT NULL,
    "brightness" DECIMAL(65,30),
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "department" TEXT,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "nearProjectId" TEXT,
    "nearProjectDistance" DECIMAL(65,30),
    "estimatedHectaresLost" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deforestation_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "generatedBy" TEXT,
    "parameters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_cache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_key" ON "projects"("name");

-- CreateIndex
CREATE INDEX "projects_department_idx" ON "projects"("department");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_organizationId_idx" ON "projects"("organizationId");

-- CreateIndex
CREATE INDEX "project_documents_projectId_idx" ON "project_documents"("projectId");

-- CreateIndex
CREATE INDEX "project_status_history_projectId_idx" ON "project_status_history"("projectId");

-- CreateIndex
CREATE INDEX "carbon_credits_projectId_idx" ON "carbon_credits"("projectId");

-- CreateIndex
CREATE INDEX "deforestation_alerts_detectedAt_idx" ON "deforestation_alerts"("detectedAt");

-- CreateIndex
CREATE INDEX "deforestation_alerts_status_idx" ON "deforestation_alerts"("status");

-- CreateIndex
CREATE INDEX "deforestation_alerts_department_idx" ON "deforestation_alerts"("department");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "reports_type_idx" ON "reports"("type");

-- CreateIndex
CREATE UNIQUE INDEX "api_cache_cacheKey_key" ON "api_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "api_cache_expiresAt_idx" ON "api_cache"("expiresAt");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_status_history" ADD CONSTRAINT "project_status_history_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_credits" ADD CONSTRAINT "carbon_credits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
