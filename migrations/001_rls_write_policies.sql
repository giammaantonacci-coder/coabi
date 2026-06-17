-- ============================================================
-- Migrazione 001 — Policy di WRITE per RLS
-- Applica nel SQL Editor di Supabase (Database → SQL Editor).
-- ============================================================

-- house_members
create policy "puoi unirti a una casa come te stesso" on house_members
  for insert with check (user_id = auth.uid());

-- expenses
create policy "membri possono aggiungere spese alla propria casa" on expenses
  for insert with check (
    house_id in (select house_id from house_members where user_id = auth.uid() and left_at is null)
    and paid_by in (select id from house_members where user_id = auth.uid() and left_at is null)
  );

-- settlements
create policy "membri possono registrare i propri pagamenti" on settlements
  for insert with check (
    house_id in (select house_id from house_members where user_id = auth.uid() and left_at is null)
    and from_member in (select id from house_members where user_id = auth.uid() and left_at is null)
  );

-- shopping_items INSERT
create policy "membri possono aggiungere elementi alla lista" on shopping_items
  for insert with check (
    house_id in (select house_id from house_members where user_id = auth.uid() and left_at is null)
    and requested_by in (select id from house_members where user_id = auth.uid() and left_at is null)
  );

-- shopping_items UPDATE (chiunque nella casa può segnare "preso")
create policy "membri possono aggiornare la lista della propria casa" on shopping_items
  for update using (
    house_id in (select house_id from house_members where user_id = auth.uid() and left_at is null)
  );

-- deposit_contributions
create policy "membri possono registrare la propria cauzione" on deposit_contributions
  for insert with check (
    house_id in (select house_id from house_members where user_id = auth.uid() and left_at is null)
    and member_id in (select id from house_members where user_id = auth.uid() and left_at is null)
  );

-- documents
create policy "membri possono caricare i propri documenti" on documents
  for insert with check (
    member_id in (select id from house_members where user_id = auth.uid() and left_at is null)
  );

-- landlord_links
create policy "membri possono invitare il proprietario" on landlord_links
  for insert with check (
    invited_by in (select id from house_members where user_id = auth.uid() and left_at is null)
  );
