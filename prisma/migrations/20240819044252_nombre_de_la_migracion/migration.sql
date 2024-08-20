-- AlterTable
ALTER TABLE `user` ADD COLUMN `diasExpiracion` INTEGER NOT NULL DEFAULT 30,
    ALTER COLUMN `fechaCambioContrasena` DROP DEFAULT;
