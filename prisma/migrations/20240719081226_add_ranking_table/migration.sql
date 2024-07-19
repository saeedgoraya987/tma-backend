/*
  Warnings:

  - You are about to drop the column `created` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[inviteeId]` on the table `Referal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `created`,
    DROP COLUMN `rank`,
    ADD COLUMN `createAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `Rank` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ranking` INTEGER NOT NULL DEFAULT 0,
    `totalScoreEarned` INTEGER NOT NULL DEFAULT 0,
    `numFriends` INTEGER NOT NULL DEFAULT 0,
    `inviterId` INTEGER NOT NULL,
    `createAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Rank_inviterId_key`(`inviterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Referal_inviteeId_key` ON `Referal`(`inviteeId`);

-- AddForeignKey
ALTER TABLE `Rank` ADD CONSTRAINT `Rank_inviterId_fkey` FOREIGN KEY (`inviterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
