-- DropForeignKey
ALTER TABLE `creator_email_accounts` DROP FOREIGN KEY `creator_email_accounts_creatorId_fkey`;

-- DropIndex
DROP INDEX `creator_email_accounts_creatorId_fkey` ON `creator_email_accounts`;

-- AlterTable
ALTER TABLE `admin_users` ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `creator_email_accounts` MODIFY `creatorId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `creator_email_accounts` ADD CONSTRAINT `creator_email_accounts_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
