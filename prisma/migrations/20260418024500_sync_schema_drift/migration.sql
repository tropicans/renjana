-- AlterTable
ALTER TABLE "courses" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'ONLINE';

-- AlterTable
ALTER TABLE "registrations" ADD COLUMN "class_group_id" TEXT;

-- CreateTable
CREATE TABLE "class_groups" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modality" "ParticipantMode" NOT NULL,
    "capacity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "instructor_name" TEXT,
    "location" TEXT,
    "zoom_link" TEXT,
    "zoom_passcode" TEXT,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_payments" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "invoice_url" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "payer_email" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_groups_event_id_idx" ON "class_groups"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "registration_payments_external_id_key" ON "registration_payments"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "registration_payments_invoice_id_key" ON "registration_payments"("invoice_id");

-- CreateIndex
CREATE INDEX "registration_payments_registration_id_idx" ON "registration_payments"("registration_id");

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_class_group_id_fkey" FOREIGN KEY ("class_group_id") REFERENCES "class_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_payments" ADD CONSTRAINT "registration_payments_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
