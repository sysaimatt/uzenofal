# Üzenőfal

Egyszerű publikus üzenőfal webalkalmazás. Üzenetet írhatsz, elmentheted az adatbázisba, és törölheted a bejegyzéseket.

**Stack:** Next.js · TypeScript · Tailwind CSS · Supabase · Vercel

## Funkciók

- Üzenet írása és mentése Supabase adatbázisba
- Üzenetek listázása fordított időrendben
- Bejegyzések törlése

## Helyi fejlesztés

1. Klónozd a repót
2. Másold az `.env.example` fájlt `.env.local` névre és töltsd ki a Supabase adatokkal:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Hozd létre a táblát a Supabase SQL Editorban (`supabase-schema.sql` alapján)
4. `npm install && npm run dev`

## Supabase tábla

Futtasd a `supabase-schema.sql` fájl tartalmát a Supabase SQL Editorban.

## Deployment (Vercel)

1. Importáld a GitHub repót a Vercelbe
2. Add meg a két environment variable-t (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Deploy

---

Készítette: **SysAI** – AI használatával – [www.sysai.hu](https://www.sysai.hu)
