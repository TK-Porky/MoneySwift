-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number    VARCHAR(20)  UNIQUE NOT NULL,   -- Identifiant principal
  email           VARCHAR(255) UNIQUE,
  full_name       VARCHAR(255) NOT NULL,
  pin_hash        VARCHAR(255) NOT NULL,           -- PIN 6 chiffres hashé
  profile_photo   TEXT,
  kyc_status      ENUM('PENDING','VERIFIED','REJECTED') DEFAULT 'PENDING',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token   VARCHAR(512) UNIQUE NOT NULL,
  device_info     JSONB,                           -- OS, device name
  ip_address      INET,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ACCOUNTS & WALLETS
-- =============================================

CREATE TABLE accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  account_number  VARCHAR(20) UNIQUE NOT NULL,     -- MS-2025-XXXXXX
  account_type    ENUM('PERSONAL','BUSINESS') DEFAULT 'PERSONAL',
  currency        VARCHAR(3) DEFAULT 'XAF',        -- Franc CFA
  status          ENUM('ACTIVE','FROZEN','CLOSED') DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wallets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID REFERENCES accounts(id) ON DELETE CASCADE,
  provider        ENUM('MTN','ORANGE','MONEYSWIFT') NOT NULL,
  provider_phone  VARCHAR(20),                     -- Numéro MTN/Orange lié
  balance         DECIMAL(15,2) DEFAULT 0.00,
  is_primary      BOOLEAN DEFAULT FALSE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRANSACTIONS
-- =============================================

CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       VARCHAR(50) UNIQUE NOT NULL,     -- TXN-20251217-XXXXX
  sender_wallet   UUID REFERENCES wallets(id),
  receiver_wallet UUID REFERENCES wallets(id),
  type            ENUM('DEPOSIT','WITHDRAWAL','TRANSFER','PAYMENT') NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  fee             DECIMAL(15,2) DEFAULT 0.00,
  currency        VARCHAR(3) DEFAULT 'XAF',
  status          ENUM('PENDING','PROCESSING','SUCCESS','FAILED','REVERSED'),
  provider        ENUM('MTN','ORANGE','ANGARA_PAY'),
  provider_ref    VARCHAR(255),                    -- Référence opérateur
  metadata        JSONB,                           -- Données additionnelles
  description     TEXT,
  initiated_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  
  -- Snapshot des soldes pour audit
  sender_balance_before   DECIMAL(15,2),
  sender_balance_after    DECIMAL(15,2),
  receiver_balance_before DECIMAL(15,2),
  receiver_balance_after  DECIMAL(15,2)
);

CREATE INDEX idx_txn_sender   ON transactions(sender_wallet, initiated_at DESC);
CREATE INDEX idx_txn_receiver ON transactions(receiver_wallet, initiated_at DESC);
CREATE INDEX idx_txn_status   ON transactions(status);

-- =============================================
-- VIRTUAL CARDS
-- =============================================

CREATE TABLE virtual_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID REFERENCES accounts(id) ON DELETE CASCADE,
  card_number     VARCHAR(16) NOT NULL,            -- Stocké chiffré (AES-256)
  card_holder     VARCHAR(255) NOT NULL,
  expiry_month    SMALLINT NOT NULL,
  expiry_year     SMALLINT NOT NULL,
  cvv_hash        VARCHAR(255) NOT NULL,           -- Jamais en clair
  network         ENUM('VISA','MASTERCARD') DEFAULT 'VISA',
  spending_limit  DECIMAL(15,2),
  status          ENUM('ACTIVE','FROZEN','EXPIRED','CANCELLED') DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  type            ENUM('TRANSACTION','SECURITY','PROMOTION','SYSTEM'),
  title           VARCHAR(255) NOT NULL,
  body            TEXT NOT NULL,
  data            JSONB,                           -- Ex: { transaction_id }
  channel         ENUM('PUSH','SMS','EMAIL','IN_APP'),
  is_read         BOOLEAN DEFAULT FALSE,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
