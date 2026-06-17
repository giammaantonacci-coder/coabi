-- ============================================================
-- Migrazione 002 — RLS per houses e profiles
-- Applica nel SQL Editor di Supabase dopo la migrazione 001.
-- ============================================================

-- ── houses ──────────────────────────────────────────────────
-- Supabase abilita RLS su houses anche se non è nel nostro
-- schema originale (verificato: errore 42501 su INSERT).

alter table houses enable row level security;

-- Qualsiasi utente autenticato può creare una casa.
-- La validazione dell'invite_code avviene a livello applicativo.
create policy "utenti autenticati possono creare una casa" on houses
  for insert with check (auth.uid() is not null);

-- Un membro attivo della casa può vederla.
-- Un proprietario con link accettato può vederla.
create policy "membri e proprietari vedono le proprie case" on houses
  for select using (
    exists (
      select 1 from house_members
      where house_members.house_id = houses.id
        and house_members.user_id = auth.uid()
        and house_members.left_at is null
    )
    or exists (
      select 1 from landlord_links
      where landlord_links.house_id = houses.id
        and landlord_links.landlord_id = auth.uid()
        and landlord_links.status = 'accettato'
    )
  );

-- ── profiles ─────────────────────────────────────────────────
-- Stessa situazione: potenzialmente attivo su Supabase anche
-- senza alter table esplicito nel nostro schema.

alter table profiles enable row level security;

-- Puoi creare solo il tuo profilo (id deve corrispondere all'utente auth).
create policy "crea il tuo profilo" on profiles
  for insert with check (id = auth.uid());

-- Vedi il tuo profilo + quello dei coinquilini nella tua stessa casa.
-- Necessario perché ogni pagina mostra nomi e colori di tutti i membri.
create policy "vedi il tuo profilo e quello dei coinquilini" on profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1 from house_members me
      join house_members them on them.house_id = me.house_id
      where me.user_id = auth.uid()
        and them.user_id = profiles.id
        and me.left_at is null
    )
  );

-- Puoi aggiornare solo il tuo profilo (per future modifiche a nome/colore).
create policy "aggiorna il tuo profilo" on profiles
  for update using (id = auth.uid());
