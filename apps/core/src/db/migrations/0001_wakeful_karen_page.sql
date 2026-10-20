CREATE TABLE `tool_calls` (
	`key` text PRIMARY KEY NOT NULL,
	`tool` text NOT NULL,
	`response` text NOT NULL,
	`created_at` integer NOT NULL
);
