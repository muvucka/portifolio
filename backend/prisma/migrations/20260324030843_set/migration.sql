/*
  Corrigido:
  - Evita conflito de UNIQUE
  - Preenche dados antes de NOT NULL
  - Garante valores únicos
*/

-- DropForeignKey
ALTER TABLE `card` DROP FOREIGN KEY `Card_setCode_fkey`;

-- DropIndex
DROP INDEX `Set_name_key` ON `set`;

-- 1. Adiciona colunas como NULL (temporariamente)
ALTER TABLE `set`
  ADD COLUMN `code` VARCHAR(191) NULL,
  ADD COLUMN `iconSvg` VARCHAR(191) NULL,
  ADD COLUMN `type` VARCHAR(191) NULL;

-- 2. Preenche com valores únicos
UPDATE `set`
SET
  `code` = CONCAT('set_', id),
  `type` = 'default';

-- 3. Agora sim cria o UNIQUE (sem conflito)
CREATE UNIQUE INDEX `Set_code_key` ON `Set`(`code`);

-- 4. Torna obrigatório
ALTER TABLE `Set`
  MODIFY `code` VARCHAR(191) NOT NULL,
  MODIFY `type` VARCHAR(191) NOT NULL;

-- 5. Índices adicionais
CREATE INDEX `Set_releaseAt_idx` ON `Set`(`releaseAt`);
CREATE INDEX `Set_type_idx` ON `Set`(`type`);

-- 6. Recria a FK apontando pro code
ALTER TABLE `Card`
ADD CONSTRAINT `Card_setCode_fkey`
FOREIGN KEY (`setCode`) REFERENCES `Set`(`code`)
ON DELETE RESTRICT ON UPDATE CASCADE;