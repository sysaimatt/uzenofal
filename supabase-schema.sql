-- ============================================================
-- Üzenőfal – teljes séma (v2)
-- Futtasd le a Supabase SQL Editorban
-- Ha már létezik az előző verzió, ez törli és újra létrehozza
-- ============================================================

drop table if exists likes;
drop table if exists messages;

-- Üzenetek tábla
create table messages (
  id bigint generated always as identity primary key,
  content text not null,
  author text not null default 'Névtelen',
  created_at timestamptz default now() not null
);

-- Like-ok tábla
create table likes (
  id bigint generated always as identity primary key,
  message_id bigint not null references messages(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- Row Level Security
alter table messages enable row level security;
create policy "Anyone can read messages"  on messages for select using (true);
create policy "Anyone can insert messages" on messages for insert with check (true);
create policy "Anyone can delete messages" on messages for delete using (true);

alter table likes enable row level security;
create policy "Anyone can read likes"  on likes for select using (true);
create policy "Anyone can insert likes" on likes for insert with check (true);

-- Realtime engedélyezése (szükséges a valós idejű frissítéshez)
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table likes;
