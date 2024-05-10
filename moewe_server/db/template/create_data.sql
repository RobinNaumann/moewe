drop table if exists "event";
drop table if exists "app";
drop table if exists "role";
drop table if exists "project";
drop table if exists "account";

create table "account" (
    "id"            varchar(50)     not null,
    "email"         varchar(255)    not null unique,
    "name"          varchar(255)    not null,
    "verified"      boolean         not null    default FALSE,
    "privilege"     bigint,    
    "pw_hash"       varchar(255)    not null,
    "pw_salt"       varchar(255)    not null,
    primary key("id")   
);

create table "project" (
    "id"            varchar(50)     not null,
    "name"          varchar(255)    not null,
    "about"         varchar(255)    not null,
    "created_at"    bigint          not null,
    "config"        TEXT            null,
    primary key ("id")
);

create table "role" (
    "account"       varchar(50)     not null,
    "project"       varchar(50)     not null,
    "role"          varchar(255)    not null,
    primary key ("account", "project")
    foreign key ("account") references "account"("id") on delete cascade,
    foreign key ("project") references "project"("id") on delete cascade
);

create table "app" (
    "id"            varchar(50)     not null,
    "project"       varchar(50)     not null,
    "name"          varchar(255)    not null,
    "config"        text            null,
    primary key ("id")
    foreign key ("project") references "project"("id") on delete cascade
);

create table "event" (  
    "id"            varchar(50)     not null,
    "app"           varchar(50)     not null,
    "type"          varchar(50)     not null,
    "key"           VARCHAR(50)     not null,
    "created_at"    bigint          not null,
    "meta"          TEXT,
    "data"          TEXT,
    primary key("id"),
    foreign key("app") references "app"("id") on delete cascade
);

/* make the events table act like a ring buffer for each app. in sqlite syntax */
/*create trigger "event_insert" after insert on "event"
begin
    delete from "event" where "app" = new."app" and "id" not in (
        select "id" from "event" where "app" = new."app" order by "created_at" desc limit 100000
    );
end;*/