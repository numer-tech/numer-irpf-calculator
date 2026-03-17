CREATE TABLE `empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cnpj` varchar(30),
	`crc` varchar(50),
	`responsavel` varchar(255),
	`email` varchar(320),
	`telefone` varchar(30),
	`whatsapp` varchar(30),
	`endereco` text,
	`site` varchar(500),
	`logoUrl` text,
	`logoKey` varchar(512),
	`corPrimaria` varchar(10) NOT NULL DEFAULT '#F97316',
	`corSecundaria` varchar(10) NOT NULL DEFAULT '#FB923C',
	`corTextoPrimaria` varchar(10) NOT NULL DEFAULT '#FFFFFF',
	`configProposta` json,
	`configPrecos` json,
	`configDescontos` json,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `empresas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `internalUsers` MODIFY COLUMN `role` enum('user','admin','superadmin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `internalUsers` ADD `empresaId` int;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `empresaId` int;--> statement-breakpoint
ALTER TABLE `internalUsers` ADD CONSTRAINT `internalUsers_empresaId_empresas_id_fk` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_empresaId_empresas_id_fk` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE no action ON UPDATE no action;