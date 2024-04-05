# moeve_server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.16. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


```sql
create table `account` (
  `id` varchar(50) not null,
  `email` varchar(255) not null,
  `name` varchar(255) not null,
  `verified` BOOLEAN not null default FALSE,
  `password` varchar(255) not null,
  `salt` varchar(255) not null,
  primary key (`id`)
);

create table `role` (
  `account` varchar(50) not null,
  `project` varchar(50) not null,
  `role` varchar(255) not null,
  primary key (`account`, `project`)
  FOREIGN KEY (`account`) REFERENCES account(`id`) 
  FOREIGN KEY (`project`) REFERENCES project(`id`) 
);

create table `project` (
  `id` varchar(50) not null,
  `name` varchar(255) not null,
  `about` varchar(255) not null,
  `created_at` BIGINT not null,
  `config` TEXT null,
  primary key (`id`)
);

create table `event` (
  `id` varchar(50) not null,
  `project` varchar(50) not null,
  `type` varchar(50) not null,
  `key` VARCHAR(50) not null,
  `created_at` int not null,
  `session` varchar(255) not null,
  `location` TEXT null,
  `data` TEXT null,
  primary key (`id`)
  FOREIGN KEY (`project`) REFERENCES project(`id`) 
);
```