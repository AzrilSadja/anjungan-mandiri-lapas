CREATE TABLE IF NOT EXISTS "queue_state" (
  "id" INTEGER NOT NULL,
  "business_date" TEXT NOT NULL,
  "counter_a" INTEGER NOT NULL DEFAULT 0,
  "counter_b" INTEGER NOT NULL DEFAULT 0,
  "counter_c" INTEGER NOT NULL DEFAULT 0,
  "counter_d" INTEGER NOT NULL DEFAULT 0,
  "current_a" TEXT NOT NULL DEFAULT 'A-000',
  "current_b" TEXT NOT NULL DEFAULT 'B-000',
  "current_c" TEXT NOT NULL DEFAULT 'C-000',
  "current_d" TEXT NOT NULL DEFAULT 'D-000',
  "updated_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "queue_state_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "queue_tickets" (
  "id" BIGSERIAL NOT NULL,
  "business_date" TEXT NOT NULL,
  "nomor" TEXT NOT NULL,
  "loket" INTEGER NOT NULL,
  "layanan" TEXT NOT NULL,
  "kode" TEXT NOT NULL,
  "waktu" BIGINT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "called_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "queue_tickets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "queue_tickets_business_date_status_kode_id_idx"
  ON "queue_tickets"("business_date", "status", "kode", "id");

CREATE INDEX IF NOT EXISTS "queue_tickets_status_loket_id_idx"
  ON "queue_tickets"("status", "loket", "id");

CREATE INDEX IF NOT EXISTS "queue_tickets_business_date_id_idx"
  ON "queue_tickets"("business_date", "id");
