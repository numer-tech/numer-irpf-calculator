CREATE TABLE `internalUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internalUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `internalUsers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `orcamentos` DROP FOREIGN KEY `orcamentos_criadoPor_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_internalUsers_id_fk` FOREIGN KEY (`userId`) REFERENCES `internalUsers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_criadoPor_internalUsers_id_fk` FOREIGN KEY (`criadoPor`) REFERENCES `internalUsers`(`id`) ON DELETE no action ON UPDATE no action;