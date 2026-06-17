-- ============================================================
-- COABI — schema di base (Supabase / Postgres)
-- Punto di partenza per Claude Code: questo è il "cuore" del
-- prodotto. Ogni scelta qui sotto riflette una decisione presa
-- nel brief, non è arbitraria — leggi i commenti prima di
-- modificarla, e fai rivedere a Claude (qui in chat) qualsiasi
-- cambiamento a expenses / deposit_contributions / landlord_links.
--
-- Su Supabase: gen_random_uuid() richiede l'estensione pgcrypto,
-- abilitata di default sui nuovi progetti. Se manca: 
-- create extension if not exists pgcrypto;
-- ============================================================

-- Le persone sono già gestite da Supabase Auth (auth.users).
-- Qui teniamo solo i dati di profilo che servono al prodotto.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_color text default '#5C7E70',
  created_at timestamptz default now()
);

-- Una casa è l'entità persistente: sopravvive al ricambio inquilini.
create table houses (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  city text,
  property_type text,
  contract_start date,
  contract_end date,            -- è la data che sblocca il fondo cauzione
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

-- Chi vive in una casa, e a quali condizioni PERSONALI.
-- Nessuna regola di divisione qui: ogni riga ha il proprio affitto,
-- perché stanze diverse hanno affitti diversi (deciso nel brief).
create table house_members (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  room_label text,
  monthly_rent numeric(10,2) not null default 0,
  joined_at date not null default current_date,
  left_at date,                 -- null = ancora in casa
  unique (house_id, user_id)
);

-- Spese: "comune" (divisa tra i membri attivi) o "personale"
-- (a carico di un singolo — tipico esito della lista della spesa).
create table expenses (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  kind text not null check (kind in ('comune', 'personale')),
  description text not null,
  amount numeric(10,2) not null check (amount > 0),
  paid_by uuid not null references house_members(id),
  owed_by uuid references house_members(id),   -- solo se kind = 'personale'
  source text not null default 'manuale' check (source in ('manuale', 'lista_spesa')),
  created_at timestamptz default now()
);

-- Pagamenti tra coinquilini: sempre "segnati", mai processati qui.
-- Il passaggio di soldi vero avviene fuori dall'app (Revolut/PayPal).
create table settlements (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  from_member uuid not null references house_members(id),
  to_member uuid not null references house_members(id),
  amount numeric(10,2) not null check (amount > 0),
  settled_at timestamptz default now()
);

-- Lista della spesa: la richiesta diventa spesa nel momento in cui
-- viene "presa" — è il loop anti-cimitero di cui abbiamo parlato.
create table shopping_items (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  item text not null,
  tag text not null check (tag in ('comune', 'personale')),
  requested_by uuid not null references house_members(id),
  status text not null default 'da_comprare' check (status in ('da_comprare', 'preso')),
  resulting_expense_id uuid references expenses(id),
  created_at timestamptz default now()
);

-- Fondo cauzione: tracciato per VERSAMENTO, non per testa — chi ha
-- la stanza grande probabilmente ha versato più cauzione degli altri.
-- "refunded" diventa true solo a fine contratto, mai prima.
create table deposit_contributions (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  member_id uuid not null references house_members(id),
  amount numeric(10,2) not null check (amount > 0),
  contributed_at date not null default current_date,
  refunded boolean not null default false,
  refunded_at date
);

-- Documenti caricati alla registrazione (carta d'identità, contratto).
-- file_path punta a un oggetto in Supabase Storage, non al file stesso.
create table documents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references house_members(id) on delete cascade,
  doc_type text not null check (doc_type in ('carta_identita', 'contratto')),
  file_path text not null,
  uploaded_at timestamptz default now()
);

-- Il confine privacy del modello B2B2C: un proprietario vede SOLO le
-- case a cui è stato invitato esplicitamente da un inquilino, e MAI
-- le tabelle expenses / settlements / shopping_items — quelle restano
-- private tra coinquilini, è la promessa che fa accettare l'invito.
create table landlord_links (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  landlord_id uuid not null references profiles(id),
  invited_by uuid not null references house_members(id),
  status text not null default 'in_attesa' check (status in ('in_attesa', 'accettato', 'revocato')),
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security — qui vive davvero il confine privacy.
-- Non è una formalità: senza queste policy, qualsiasi riga è
-- visibile a chiunque abbia una chiave API. Falle rivedere a
-- Claude (qui in chat) prima di lanciare in produzione.
-- ============================================================

alter table profiles enable row level security;
alter table houses enable row level security;
alter table house_members enable row level security;
alter table expenses enable row level security;
alter table settlements enable row level security;
alter table shopping_items enable row level security;
alter table deposit_contributions enable row level security;
alter table documents enable row level security;
alter table landlord_links enable row level security;

-- profiles: ognuno vede sé stesso e i coinquilini della stessa casa.
create policy "crea il tuo profilo" on profiles
  for insert with check (id = auth.uid());

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

create policy "aggiorna il tuo profilo" on profiles
  for update using (id = auth.uid());

-- houses: chiunque autenticato può creare una casa; la vedono i membri e i proprietari.
create policy "utenti autenticati possono creare una casa" on houses
  for insert with check (auth.uid() is not null);

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

-- ============================================================
-- Funzioni SECURITY DEFINER — bypassano RLS per i controlli
-- di membership, evitando la ricorsione infinita (errore 42P17)
-- che si verifica quando una policy su house_members interroga
-- house_members stessa.
-- ============================================================

create or replace function public.is_member_of_house(target_house_id uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from house_members
    where house_id = target_house_id
      and user_id = auth.uid()
      and left_at is null
  );
$$;

create or replace function public.is_my_member_id(hm_id uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from house_members
    where id = hm_id
      and user_id = auth.uid()
      and left_at is null
  );
$$;

-- ── SELECT ───────────────────────────────────────────────────

create policy "membri vedono la propria casa" on house_members
  for select using (is_member_of_house(house_id));

create policy "membri vedono le proprie spese" on expenses
  for select using (is_member_of_house(house_id));

create policy "membri vedono i propri saldi" on settlements
  for select using (is_member_of_house(house_id));

create policy "membri vedono la propria lista spesa" on shopping_items
  for select using (is_member_of_house(house_id));

create policy "membri vedono la propria cauzione" on deposit_contributions
  for select using (is_member_of_house(house_id));

create policy "membri vedono i propri documenti" on documents
  for select using (
    exists (
      select 1 from house_members hm
      where hm.id = documents.member_id
        and is_member_of_house(hm.house_id)
    )
  );

-- NOTA DI DESIGN: i proprietari NON hanno una policy su expenses,
-- settlements o shopping_items — per costruzione, restano invisibili
-- a chiunque non sia house_member. Il proprietario, una volta che
-- landlord_links.status = 'accettato', avrà accesso solo a:
-- houses, house_members (stanza, affitto, date), deposit_contributions
-- (saldo aggregato, non il dettaglio dei singoli versamenti) e documents.
-- Questa è la policy sul collegamento stesso:
create policy "il proprietario vede solo i propri collegamenti accettati" on landlord_links
  for select using (landlord_id = auth.uid() and status = 'accettato');

-- ============================================================
-- Policy di WRITE — senza queste, RLS blocca ogni INSERT/UPDATE.
-- Principio: un membro può scrivere solo nella casa di cui fa
-- parte, e solo a nome proprio (user_id / paid_by / member_id
-- deve sempre corrispondere all'utente autenticato).
-- ============================================================

-- ── INSERT / UPDATE ──────────────────────────────────────────

-- house_members: solo a nome proprio.
create policy "puoi unirti a una casa come te stesso" on house_members
  for insert with check (user_id = auth.uid());

-- expenses: membro attivo della casa, pagante = se stesso.
create policy "membri possono aggiungere spese alla propria casa" on expenses
  for insert with check (
    is_member_of_house(house_id) and is_my_member_id(paid_by)
  );

-- settlements: membro attivo della casa, pagante = se stesso.
create policy "membri possono registrare i propri pagamenti" on settlements
  for insert with check (
    is_member_of_house(house_id) and is_my_member_id(from_member)
  );

-- shopping_items: solo a nome proprio.
create policy "membri possono aggiungere elementi alla lista" on shopping_items
  for insert with check (
    is_member_of_house(house_id) and is_my_member_id(requested_by)
  );

-- shopping_items UPDATE: chiunque nella casa può segnare "preso".
create policy "membri possono aggiornare la lista della propria casa" on shopping_items
  for update using (is_member_of_house(house_id));

-- deposit_contributions: solo a nome proprio.
create policy "membri possono registrare la propria cauzione" on deposit_contributions
  for insert with check (
    is_member_of_house(house_id) and is_my_member_id(member_id)
  );

-- documents: solo i propri documenti.
create policy "membri possono caricare i propri documenti" on documents
  for insert with check (is_my_member_id(member_id));

-- landlord_links: solo un membro attivo può invitare il proprietario.
create policy "membri possono invitare il proprietario" on landlord_links
  for insert with check (is_my_member_id(invited_by));
