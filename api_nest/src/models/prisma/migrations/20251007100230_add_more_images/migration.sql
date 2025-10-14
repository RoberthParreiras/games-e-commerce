/*
  Warnings:

  - You are about to drop the column `image` on the `Games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Games` DROP COLUMN `image`;

-- CreateTable
CREATE TABLE `GameImage` (
    `id` BINARY(16) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `gameId` BINARY(16) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GameImage` ADD CONSTRAINT `GameImage_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Games`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
