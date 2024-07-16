-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `point` INTEGER NOT NULL,
    `registered` DATETIME(3) NOT NULL,
    `rank` INTEGER NULL,
    `created` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Referal` (
    `id` INTEGER NOT NULL,
    `scoreEarned` INTEGER NULL,
    `inviterId` INTEGER NOT NULL,
    `inviteeId` INTEGER NOT NULL,
    `createAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Referal_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Referal` ADD CONSTRAINT `Referal_inviterId_fkey` FOREIGN KEY (`inviterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Referal` ADD CONSTRAINT `Referal_inviteeId_fkey` FOREIGN KEY (`inviteeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
