/*
  Warnings:

  - A unique constraint covering the columns `[name,setCode]` on the table `Card` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Card_name_setCode_key` ON `Card`(`name`, `setCode`);
