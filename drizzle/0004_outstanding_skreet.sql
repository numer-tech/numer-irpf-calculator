CREATE TABLE `configPrecos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`valorBase` decimal(10,2) NOT NULL DEFAULT '150.00',
	`itensPreco` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` int,
	CONSTRAINT `configPrecos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `empresas`;--> statement-breakpoint
ALTER TABLE `internalUsers` DROP FOREIGN KEY `internalUsers_empresaId_empresas_id_fk`;
--> statement-breakpoint
ALTER TABLE `orcamentos` DROP FOREIGN KEY `orcamentos_empresaId_empresas_id_fk`;
--> statement-breakpoint
ALTER TABLE `internalUsers` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `configPrecos` ADD CONSTRAINT `configPrecos_updatedBy_internalUsers_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `internalUsers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `internalUsers` DROP COLUMN `empresaId`;--> statement-breakpoint
ALTER TABLE `orcamentos` DROP COLUMN `empresaId`;