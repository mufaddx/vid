-- AlterTable
ALTER TABLE `email_threads` ADD COLUMN `contactName` VARCHAR(191) NULL,
    ADD COLUMN `unread` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `inquiries` ADD COLUMN `viewedAt` DATETIME(3) NULL;
