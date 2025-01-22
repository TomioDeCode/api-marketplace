/*
  Warnings:

  - The values [buyer,seller,admin] on the enum `users_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL;
