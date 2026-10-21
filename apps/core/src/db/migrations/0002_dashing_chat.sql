CREATE TABLE `grocery_items` (
	`key` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`quantity` text,
	`added_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
