CREATE TABLE `eco_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` varchar(32) NOT NULL,
	`material` varchar(200) NOT NULL,
	`kg` double NOT NULL,
	`description` text NOT NULL,
	`status` enum('pendente','aprovada','rejeitada') NOT NULL DEFAULT 'pendente',
	`points` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	CONSTRAINT `eco_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eco_collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` varchar(32) NOT NULL,
	`material` varchar(200) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(120) NOT NULL,
	`state` varchar(2) NOT NULL,
	`preferredDate` date NOT NULL,
	`notes` text,
	`status` enum('pendente','em_analise','confirmada','concluida','cancelada') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	CONSTRAINT `eco_collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eco_partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`kind` enum('empresa','cooperativa','ecoponto','instituicao') NOT NULL,
	`address` text NOT NULL,
	`city` varchar(120) NOT NULL,
	`state` varchar(2) NOT NULL,
	`contact` varchar(320) NOT NULL,
	`materials` json NOT NULL,
	`hours` text NOT NULL,
	`sourceUrl` varchar(2048),
	`submissionType` enum('cadastro','sugestao') NOT NULL DEFAULT 'cadastro',
	`status` enum('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	CONSTRAINT `eco_partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `eco_actions` ADD CONSTRAINT `eco_actions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eco_actions` ADD CONSTRAINT `eco_actions_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eco_collections` ADD CONSTRAINT `eco_collections_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eco_collections` ADD CONSTRAINT `eco_collections_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eco_partners` ADD CONSTRAINT `eco_partners_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eco_partners` ADD CONSTRAINT `eco_partners_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `eco_actions_user_id_idx` ON `eco_actions` (`userId`);--> statement-breakpoint
CREATE INDEX `eco_actions_status_idx` ON `eco_actions` (`status`);--> statement-breakpoint
CREATE INDEX `eco_collections_user_id_idx` ON `eco_collections` (`userId`);--> statement-breakpoint
CREATE INDEX `eco_collections_status_idx` ON `eco_collections` (`status`);--> statement-breakpoint
CREATE INDEX `eco_partners_user_id_idx` ON `eco_partners` (`userId`);--> statement-breakpoint
CREATE INDEX `eco_partners_status_idx` ON `eco_partners` (`status`);