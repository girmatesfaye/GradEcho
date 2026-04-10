alter table public.memories
  alter column title set default null;

update public.memories
set title = coalesce(nullif(title, ''), quote)
where title is null or btrim(title) = '';

alter table public.memories
  alter column title set not null;

alter table public.memories
  drop column if exists quote;
