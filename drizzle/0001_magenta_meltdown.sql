CREATE TABLE `orcamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteNome` varchar(255) NOT NULL,
	`clienteCpf` varchar(20),
	`clienteTelefone` varchar(30),
	`clienteEmail` varchar(320),
	`checklist` json NOT NULL,
	`resultado` json NOT NULL,
	`valorCalculado` decimal(10,2) NOT NULL,
	`valorFinal` decimal(10,2) NOT NULL,
	`status` enum('pendente','aprovado','concluido','cancelado') NOT NULL DEFAULT 'pendente',
	`comprovanteUrl` text,
	`comprovanteKey` varchar(512),
	`observacoes` text,
	`criadoPor` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_criadoPor_users_id_fk` FOREIGN KEY (`criadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;