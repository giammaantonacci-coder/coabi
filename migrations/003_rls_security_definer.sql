-- ============================================================
-- Migrazione 003 — Elimina la ricorsione RLS con funzioni
--                  SECURITY DEFINER
--
-- Problema: le policy SELECT su house_members contenevano
-- una subquery su house_members stessa → ricorsione infinita
-- (errore 42P17). Stesso bug latente su tutte le policy che
-- interrogano house_members dall'esterno.
--
-- Soluzione: due funzioni SECURITY DEFINER che eseguono le
-- query su house_members bypassando RLS, così nessuna policy
-- ha più bisogno di subquery dirette sulla tabella.
-- ============================================================

-- ── Funzione 1: sono membro attivo di questa casa? ──────────
CREATE OR REPLACE FUNCTION public.is_member_of_house(target_house_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM house_members
    WHERE house_id = target_house_id
      AND user_id = auth.uid()
      AND left_at IS NULL
  );
$$;

-- ── Funzione 2: questo house_member.id appartiene a me? ─────
-- Serve per i controlli su paid_by / from_member / requested_by
-- / member_id nelle policy INSERT.
CREATE OR REPLACE FUNCTION public.is_my_member_id(hm_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM house_members
    WHERE id = hm_id
      AND user_id = auth.uid()
      AND left_at IS NULL
  );
$$;

-- ============================================================
-- house_members — fix della ricorsione diretta
-- ============================================================
DROP POLICY IF EXISTS "membri vedono la propria casa" ON house_members;
CREATE POLICY "membri vedono la propria casa" ON house_members
  FOR SELECT USING (is_member_of_house(house_id));

-- ============================================================
-- houses
-- ============================================================
DROP POLICY IF EXISTS "membri e proprietari vedono le proprie case" ON houses;
CREATE POLICY "membri e proprietari vedono le proprie case" ON houses
  FOR SELECT USING (
    is_member_of_house(id)
    OR EXISTS (
      SELECT 1 FROM landlord_links
      WHERE landlord_links.house_id = houses.id
        AND landlord_links.landlord_id = auth.uid()
        AND landlord_links.status = 'accettato'
    )
  );

-- ============================================================
-- expenses
-- ============================================================
DROP POLICY IF EXISTS "membri vedono le proprie spese" ON expenses;
CREATE POLICY "membri vedono le proprie spese" ON expenses
  FOR SELECT USING (is_member_of_house(house_id));

DROP POLICY IF EXISTS "membri possono aggiungere spese alla propria casa" ON expenses;
CREATE POLICY "membri possono aggiungere spese alla propria casa" ON expenses
  FOR INSERT WITH CHECK (
    is_member_of_house(house_id)
    AND is_my_member_id(paid_by)
  );

-- ============================================================
-- settlements
-- ============================================================
DROP POLICY IF EXISTS "membri vedono i propri saldi" ON settlements;
CREATE POLICY "membri vedono i propri saldi" ON settlements
  FOR SELECT USING (is_member_of_house(house_id));

DROP POLICY IF EXISTS "membri possono registrare i propri pagamenti" ON settlements;
CREATE POLICY "membri possono registrare i propri pagamenti" ON settlements
  FOR INSERT WITH CHECK (
    is_member_of_house(house_id)
    AND is_my_member_id(from_member)
  );

-- ============================================================
-- shopping_items
-- ============================================================
DROP POLICY IF EXISTS "membri vedono la propria lista spesa" ON shopping_items;
CREATE POLICY "membri vedono la propria lista spesa" ON shopping_items
  FOR SELECT USING (is_member_of_house(house_id));

DROP POLICY IF EXISTS "membri possono aggiungere elementi alla lista" ON shopping_items;
CREATE POLICY "membri possono aggiungere elementi alla lista" ON shopping_items
  FOR INSERT WITH CHECK (
    is_member_of_house(house_id)
    AND is_my_member_id(requested_by)
  );

DROP POLICY IF EXISTS "membri possono aggiornare la lista della propria casa" ON shopping_items;
CREATE POLICY "membri possono aggiornare la lista della propria casa" ON shopping_items
  FOR UPDATE USING (is_member_of_house(house_id));

-- ============================================================
-- deposit_contributions
-- ============================================================
DROP POLICY IF EXISTS "membri vedono la propria cauzione" ON deposit_contributions;
CREATE POLICY "membri vedono la propria cauzione" ON deposit_contributions
  FOR SELECT USING (is_member_of_house(house_id));

DROP POLICY IF EXISTS "membri possono registrare la propria cauzione" ON deposit_contributions;
CREATE POLICY "membri possono registrare la propria cauzione" ON deposit_contributions
  FOR INSERT WITH CHECK (
    is_member_of_house(house_id)
    AND is_my_member_id(member_id)
  );

-- ============================================================
-- documents — non ha house_id, si raggiunge via member_id
-- ============================================================
DROP POLICY IF EXISTS "membri vedono i propri documenti" ON documents;
CREATE POLICY "membri vedono i propri documenti" ON documents
  FOR SELECT USING (
    -- Vedi i documenti dei membri nella tua stessa casa.
    -- La JOIN su house_members è ora sicura: house_members RLS
    -- risolve via is_member_of_house(), nessuna ricorsione.
    EXISTS (
      SELECT 1 FROM house_members hm
      WHERE hm.id = documents.member_id
        AND is_member_of_house(hm.house_id)
    )
  );

DROP POLICY IF EXISTS "membri possono caricare i propri documenti" ON documents;
CREATE POLICY "membri possono caricare i propri documenti" ON documents
  FOR INSERT WITH CHECK (is_my_member_id(member_id));
