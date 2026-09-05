-- AlterTable
ALTER TABLE `company_settings` ADD COLUMN `facebookUrl` VARCHAR(191) NULL,
    ADD COLUMN `instagramUrl` VARCHAR(191) NULL,
    ADD COLUMN `xUrl` VARCHAR(191) NULL,
    ADD COLUMN `youtubeUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `blog_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `blog_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_posts` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `coverImageUrl` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NULL,
    `tags` JSON NOT NULL,
    `authorName` VARCHAR(191) NOT NULL DEFAULT 'VIDLIX Team',
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `readingMinutes` INTEGER NOT NULL DEFAULT 4,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `legal_pages` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `legal_pages_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `footer_links` (
    `id` VARCHAR(191) NOT NULL,
    `group` ENUM('COMPANY', 'PLATFORM', 'GET_STARTED') NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `href` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `blog_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

