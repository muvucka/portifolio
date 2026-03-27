-- AlterTable
ALTER TABLE `deck` ADD COLUMN `section` ENUM('meus', 'proximos') NOT NULL DEFAULT 'meus';
