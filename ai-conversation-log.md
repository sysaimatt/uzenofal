# AI Conversation Log – Üzenőfal projekt

## Eszköz: Claude Code (claude-sonnet-4-6)

---

## 1. Projekt indítása

**Felhasználó:**
> Van egy projektfeladat amit meg kell csinálni. Készíts egy egyszerű "Üzenőfal" webalkalmazást: szöveg bevitel, Mentés gomb (Supabase-be ment), lista fordított időrendben, törlés gomb. Stack: Next.js, Vercel, Supabase, GitHub.

**Claude:**
> Terv:
> 1. Next.js projekt inicializálása (ideális Vercelhez)
> 2. Supabase kliens integrálása
> 3. Üzenőfal UI + API logika megírása
> 4. GitHub repóra feltöltés
> 5. Vercel deployment
> 6. AI conversation log csatolása

---

## 2. Node.js telepítése

**Probléma:** `npx` nem található, Node.js nincs telepítve a gépen.

**Claude megoldása:**
```bash
# nvm telepítése
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Node.js 20 telepítése
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && nvm install 20
```

**Eredmény:** Node v20.20.2, npm 10.8.2 sikeresen telepítve.

---

## 3. Next.js projekt létrehozása

```bash
npx create-next-app@latest uzenofal --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
npm install @supabase/supabase-js
```

**Döntések:**
- TypeScript: típusbiztonság
- Tailwind CSS: gyors UI stílusozás
- App Router: modern Next.js konvenció, natív Vercel support

---

## 4. Supabase integráció

**Claude által generált séma (`supabase-schema.sql`):**
```sql
create table messages (
  id bigint generated always as identity primary key,
  content text not null,
  created_at timestamptz default now() not null
);

alter table messages enable row level security;
-- + RLS policy-k: select/insert/delete mindenki számára engedélyezett
```

**Claude magyarázata az RLS-ről:**
> Row Level Security szükséges, mert Supabase alapból blokkolja a public hozzáférést. Mivel ez egy nyilvános üzenőfal, mindenki számára engedélyezzük az olvasást, írást és törlést.

---

## 5. Frontend kód (`app/page.tsx`)

**Claude által írt fő komponens funkciói:**
- `fetchMessages()`: Supabase-ből lekéri az üzeneteket, `created_at DESC` sorrendben
- `handleSave()`: Elmenti az új üzenetet, majd frissíti a listát
- `handleDelete(id)`: Törli a kiválasztott üzenetet optimista UI frissítéssel
- `useEffect`: Oldalbetöltéskor automatikusan lekéri az üzeneteket

**Ctrl+Enter** shortcut is hozzáadva a gyors küldéshez.

---

## 6. Deployment lépések

### Supabase setup
1. Supabase fiók létrehozása: supabase.com
2. New Project létrehozása
3. SQL Editor → futtatni a `supabase-schema.sql` tartalmát
4. Project Settings → API → `URL` és `anon key` kimásolása

### Vercel deployment
1. GitHub repó létrehozása és push
2. vercel.com → "New Project" → GitHub repó importálása
3. Environment Variables beállítása:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

---

## 7. Összefoglalás

Az AI (Claude) segítségével a teljes projekt megvalósult:
- Környezet felállítása (Node.js telepítés)
- Next.js projekt scaffolding
- Supabase séma tervezése RLS-sel
- Teljes frontend komponens megírása
- Deployment instrukciók

Az AI-val folytatott munka lényege: magas szintű instrukciókból konkrét, működő kódot generált, a hibákat (hiányzó Node.js) azonnal diagnosztizálta és megoldotta.
