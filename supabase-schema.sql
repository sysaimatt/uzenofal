-- Üzenőfal tábla létrehozása
-- Futtasd le ezt a Supabase SQL Editor-ban

create table messages (
  id bigint generated always as identity primary key,
  content text not null,
  created_at timestamptz default now() not null
);

-- RLS (Row Level Security) beállítás: mindenki olvashat és írhat (publikus fal)
alter table messages enable row level security;

create policy "Anyone can read messages"
  on messages for select
  using (true);

create policy "Anyone can insert messages"
  on messages for insert
  with check (true);

create policy "Anyone can delete messages"
  on messages for delete
  using (true);
