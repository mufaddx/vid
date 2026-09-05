-- CreateTable
CREATE TABLE `admin_users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'TALENT_MANAGER', 'CAMPAIGN_MANAGER', 'FINANCE_MANAGER', 'INBOX_MANAGER', 'VIEWER') NOT NULL DEFAULT 'SUPER_ADMIN',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_sessions_tokenHash_key`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'company',
    `companyName` VARCHAR(191) NOT NULL DEFAULT 'VIDLIX',
    `legalName` VARCHAR(191) NOT NULL DEFAULT 'Vidlix Media Private Limited',
    `tagline` VARCHAR(191) NOT NULL DEFAULT 'CREATORS • BRANDS • BEYOND',
    `email` VARCHAR(191) NOT NULL DEFAULT 'hello@vidlix.in',
    `phone` VARCHAR(191) NOT NULL DEFAULT '+91 90000 00000',
    `website` VARCHAR(191) NOT NULL DEFAULT 'https://vidlix.in',
    `address` VARCHAR(191) NOT NULL DEFAULT 'Delhi, India',
    `gstin` VARCHAR(191) NULL,
    `cin` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#6D28D9',
    `secondaryColor` VARCHAR(191) NOT NULL DEFAULT '#111827',
    `invoicePrefix` VARCHAR(191) NOT NULL DEFAULT 'INV',
    `receiptPrefix` VARCHAR(191) NOT NULL DEFAULT 'RCPT',
    `paymentPrefix` VARCHAR(191) NOT NULL DEFAULT 'PAY',
    `payoutPrefix` VARCHAR(191) NOT NULL DEFAULT 'PAYOUT',
    `agreementPrefix` VARCHAR(191) NOT NULL DEFAULT 'AGR',
    `defaultCommissionPct` DECIMAL(5, 2) NOT NULL DEFAULT 30,
    `defaultDueDays` INTEGER NOT NULL DEFAULT 30,
    `bankDetails` TEXT NULL,
    `upiDetails` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_sequences` (
    `id` VARCHAR(191) NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `lastN` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `document_sequences_prefix_year_key`(`prefix`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creators` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `profileImage` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'India',
    `bio` TEXT NULL,
    `longBio` TEXT NULL,
    `journeyStartYear` INTEGER NULL,
    `category` VARCHAR(191) NULL,
    `languages` JSON NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'PENDING',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `orbitPriority` INTEGER NOT NULL DEFAULT 0,
    `managementStartDate` DATETIME(3) NULL,
    `managementFee` DECIMAL(12, 2) NULL,
    `commissionPercentage` DECIMAL(5, 2) NOT NULL DEFAULT 30,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `creators_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creator_journey_entries` (
    `id` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `visible` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `platform` ENUM('INSTAGRAM', 'YOUTUBE', 'FACEBOOK') NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `platformUserId` VARCHAR(191) NULL,
    `profileUrl` VARCHAR(191) NULL,
    `connectionStatus` ENUM('NOT_CONNECTED', 'CONNECTED', 'ERROR') NOT NULL DEFAULT 'NOT_CONNECTED',
    `accessTokenRef` VARCHAR(191) NULL,
    `lastSyncedAt` DATETIME(3) NULL,
    `lastSyncError` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `social_accounts_creatorId_platform_key`(`creatorId`, `platform`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_metrics` (
    `id` VARCHAR(191) NOT NULL,
    `socialAccountId` VARCHAR(191) NOT NULL,
    `followers` INTEGER NOT NULL DEFAULT 0,
    `subscribers` INTEGER NOT NULL DEFAULT 0,
    `following` INTEGER NULL,
    `views` BIGINT NULL,
    `posts` INTEGER NULL,
    `engagementRate` DECIMAL(5, 2) NULL,
    `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `social_metrics_socialAccountId_key`(`socialAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_metric_snapshots` (
    `id` VARCHAR(191) NOT NULL,
    `socialAccountId` VARCHAR(191) NOT NULL,
    `followers` INTEGER NOT NULL DEFAULT 0,
    `subscribers` INTEGER NOT NULL DEFAULT 0,
    `capturedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creator_audience_snapshots` (
    `id` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `totalAudience` INTEGER NOT NULL,
    `capturedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `contactPerson` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `brands_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaigns` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `budget` DECIMAL(12, 2) NULL,
    `status` ENUM('DRAFT', 'PLANNING', 'CREATOR_SELECTION', 'NEGOTIATION', 'AGREEMENT_PENDING', 'ACTIVE', 'CONTENT_REVIEW', 'PUBLISHED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collaborations` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `status` ENUM('NEW', 'REVIEWING', 'CREATOR_SELECTED', 'PROPOSAL', 'NEGOTIATION', 'AGREEMENT_PENDING', 'SIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collaboration_creators` (
    `id` VARCHAR(191) NOT NULL,
    `collaborationId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `collaboration_creators_collaborationId_creatorId_key`(`collaborationId`, `creatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inquiries` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('CREATOR', 'BRAND', 'COLLABORATION') NOT NULL,
    `status` ENUM('NEW', 'UNDER_REVIEW', 'CONTACTED', 'QUALIFIED', 'APPROVED', 'REJECTED', 'ONBOARDED', 'CONVERTED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `fullName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `brandName` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `payload` JSON NOT NULL,
    `creatorId` VARCHAR(191) NULL,
    `brandId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agreement_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('CREATOR_MANAGEMENT', 'BRAND_COLLABORATION', 'CAMPAIGN_AGREEMENT', 'NDA', 'PAYMENT_AGREEMENT', 'CUSTOM') NOT NULL,
    `description` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agreements` (
    `id` VARCHAR(191) NOT NULL,
    `agreementNumber` VARCHAR(191) NOT NULL,
    `type` ENUM('CREATOR_MANAGEMENT', 'BRAND_COLLABORATION', 'CAMPAIGN_AGREEMENT', 'NDA', 'PAYMENT_AGREEMENT', 'CUSTOM') NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NULL,
    `campaignId` VARCHAR(191) NULL,
    `templateId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `version` INTEGER NOT NULL DEFAULT 1,
    `content` TEXT NULL,
    `details` JSON NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `commissionPercentage` DECIMAL(5, 2) NOT NULL DEFAULT 30,
    `signingToken` VARCHAR(191) NULL,
    `signingTokenExpiresAt` DATETIME(3) NULL,
    `brandSigningToken` VARCHAR(191) NULL,
    `brandSigningTokenExpiresAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `finalPdfAssetId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sentAt` DATETIME(3) NULL,
    `viewedAt` DATETIME(3) NULL,
    `signedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,

    UNIQUE INDEX `agreements_agreementNumber_key`(`agreementNumber`),
    UNIQUE INDEX `agreements_signingToken_key`(`signingToken`),
    UNIQUE INDEX `agreements_brandSigningToken_key`(`brandSigningToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `signatures` (
    `id` VARCHAR(191) NOT NULL,
    `agreementId` VARCHAR(191) NOT NULL,
    `signerType` ENUM('ADMIN', 'CREATOR', 'BRAND') NOT NULL,
    `signerName` VARCHAR(191) NOT NULL,
    `signerEmail` VARCHAR(191) NULL,
    `method` VARCHAR(191) NOT NULL,
    `signatureAsset` LONGTEXT NOT NULL,
    `otpVerified` BOOLEAN NOT NULL DEFAULT false,
    `signedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agreement_audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `agreementId` VARCHAR(191) NOT NULL,
    `event` VARCHAR(191) NOT NULL,
    `actor` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_challenges` (
    `id` VARCHAR(191) NOT NULL,
    `agreementId` VARCHAR(191) NOT NULL,
    `signerEmail` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `invoiceType` ENUM('CREATOR_MANAGEMENT', 'BRAND_CAMPAIGN') NOT NULL,
    `creatorId` VARCHAR(191) NULL,
    `brandId` VARCHAR(191) NULL,
    `campaignId` VARCHAR(191) NULL,
    `agreementId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL,
    `paidAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `pendingAmount` DECIMAL(12, 2) NOT NULL,
    `description` TEXT NULL,
    `issueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `pdfAssetId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoiceNumber_key`(`invoiceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `paymentNumber` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `payer` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `method` VARCHAR(191) NOT NULL,
    `transactionReference` VARCHAR(191) NULL,
    `utr` VARCHAR(191) NULL,
    `status` ENUM('RECORDED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'RECORDED',
    `notes` TEXT NULL,
    `receiptPdfAssetId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_paymentNumber_key`(`paymentNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payouts` (
    `id` VARCHAR(191) NOT NULL,
    `payoutNumber` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `invoiceId` VARCHAR(191) NULL,
    `grossAmount` DECIMAL(12, 2) NOT NULL,
    `commissionPercentage` DECIMAL(5, 2) NOT NULL,
    `commissionAmount` DECIMAL(12, 2) NOT NULL,
    `creatorAmount` DECIMAL(12, 2) NOT NULL,
    `adjustment` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `netPayable` DECIMAL(12, 2) NOT NULL,
    `paidAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `pendingAmount` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `paymentDate` DATETIME(3) NULL,
    `transactionReference` VARCHAR(191) NULL,
    `statementPdfAssetId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payouts_payoutNumber_key`(`payoutNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creator_email_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `emailAddress` VARCHAR(191) NOT NULL,
    `localPart` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL DEFAULT 'vidlix.in',
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `creator_email_accounts_emailAddress_key`(`emailAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_threads` (
    `id` VARCHAR(191) NOT NULL,
    `creatorEmailAccountId` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'ARCHIVED', 'SPAM') NOT NULL DEFAULT 'OPEN',
    `starred` BOOLEAN NOT NULL DEFAULT false,
    `lastMessageAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_messages` (
    `id` VARCHAR(191) NOT NULL,
    `threadId` VARCHAR(191) NOT NULL,
    `providerMessageId` VARCHAR(191) NULL,
    `fromEmail` VARCHAR(191) NOT NULL,
    `toEmail` VARCHAR(191) NOT NULL,
    `cc` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NOT NULL,
    `htmlBody` TEXT NULL,
    `textBody` TEXT NULL,
    `direction` ENUM('INBOUND', 'OUTBOUND') NOT NULL,
    `status` ENUM('SENT', 'DELIVERED', 'FAILED', 'RECEIVED') NOT NULL DEFAULT 'SENT',
    `receivedAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_logs` (
    `id` VARCHAR(191) NOT NULL,
    `toEmail` VARCHAR(191) NOT NULL,
    `fromEmail` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `template` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `status` ENUM('SENT', 'FAILED', 'MOCKED') NOT NULL DEFAULT 'MOCKED',
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NULL,
    `agreementId` VARCHAR(191) NULL,
    `category` ENUM('AGREEMENT', 'INVOICE', 'RECEIPT', 'PAYOUT_STATEMENT', 'NDA', 'CONTRACT', 'IDENTITY', 'OTHER') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `assetId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `creatorId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_sessions` ADD CONSTRAINT `admin_sessions_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_journey_entries` ADD CONSTRAINT `creator_journey_entries_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_accounts` ADD CONSTRAINT `social_accounts_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_metrics` ADD CONSTRAINT `social_metrics_socialAccountId_fkey` FOREIGN KEY (`socialAccountId`) REFERENCES `social_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_metric_snapshots` ADD CONSTRAINT `social_metric_snapshots_socialAccountId_fkey` FOREIGN KEY (`socialAccountId`) REFERENCES `social_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_audience_snapshots` ADD CONSTRAINT `creator_audience_snapshots_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collaborations` ADD CONSTRAINT `collaborations_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collaborations` ADD CONSTRAINT `collaborations_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collaboration_creators` ADD CONSTRAINT `collaboration_creators_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `collaborations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collaboration_creators` ADD CONSTRAINT `collaboration_creators_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agreements` ADD CONSTRAINT `agreements_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agreements` ADD CONSTRAINT `agreements_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agreements` ADD CONSTRAINT `agreements_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agreements` ADD CONSTRAINT `agreements_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `agreement_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agreements` ADD CONSTRAINT `agreements_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `signatures` ADD CONSTRAINT `signatures_agreementId_fkey` FOREIGN KEY (`agreementId`) REFERENCES `agreements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agreement_audit_logs` ADD CONSTRAINT `agreement_audit_logs_agreementId_fkey` FOREIGN KEY (`agreementId`) REFERENCES `agreements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otp_challenges` ADD CONSTRAINT `otp_challenges_agreementId_fkey` FOREIGN KEY (`agreementId`) REFERENCES `agreements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_agreementId_fkey` FOREIGN KEY (`agreementId`) REFERENCES `agreements`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payouts` ADD CONSTRAINT `payouts_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payouts` ADD CONSTRAINT `payouts_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payouts` ADD CONSTRAINT `payouts_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_email_accounts` ADD CONSTRAINT `creator_email_accounts_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_threads` ADD CONSTRAINT `email_threads_creatorEmailAccountId_fkey` FOREIGN KEY (`creatorEmailAccountId`) REFERENCES `creator_email_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_messages` ADD CONSTRAINT `email_messages_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `email_threads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_agreementId_fkey` FOREIGN KEY (`agreementId`) REFERENCES `agreements`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

