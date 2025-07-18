-- CreateTable
CREATE TABLE `category` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `word_id` CHAR(36) NOT NULL,
    `name` VARCHAR(25) NULL,
    `show_name` VARCHAR(25) NULL,

    INDEX `category_ibfk_1`(`word_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `token` (
    `user_id` CHAR(36) NOT NULL,
    `refresh_token` VARCHAR(100) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `username` VARCHAR(30) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(80) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `email_UNIQUE`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `word_mean` (
    `id` CHAR(36) NOT NULL,
    `word_id` CHAR(36) NULL,
    `example_sentence_en` VARCHAR(80) NULL,
    `example_sentence_zh` VARCHAR(80) NULL,
    `mean_en` VARCHAR(50) NULL,
    `mean_zh` VARCHAR(50) NULL,
    `part_of_speech` VARCHAR(10) NULL,

    INDEX `word_id`(`word_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `words` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `word` VARCHAR(39) NULL,
    `pronunciation` VARCHAR(255) NULL,

    UNIQUE INDEX `word`(`word`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `words_storage` (
    `user_id` CHAR(36) NOT NULL,
    `word_id` CHAR(36) NOT NULL,
    `learned` BOOLEAN NULL,
    `learn_at` TIMESTAMP(0) NULL,

    INDEX `word_id`(`word_id`),
    PRIMARY KEY (`user_id`, `word_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `category` ADD CONSTRAINT `category_ibfk_1` FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `token` ADD CONSTRAINT `token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `word_mean` ADD CONSTRAINT `word_mean_ibfk_1` FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `words_storage` ADD CONSTRAINT `words_storage_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `words_storage` ADD CONSTRAINT `words_storage_ibfk_2` FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
