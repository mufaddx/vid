-- CreateTable
CREATE TABLE `admin_login_otps` (
    `id` VARCHAR(191) NOT NULL,
    `adminUserId` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_login_otps` ADD CONSTRAINT `admin_login_otps_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

