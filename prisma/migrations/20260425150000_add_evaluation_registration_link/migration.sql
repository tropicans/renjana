ALTER TABLE "evaluations"
ADD COLUMN "registration_id" TEXT;

CREATE INDEX "evaluations_registration_id_idx" ON "evaluations"("registration_id");

ALTER TABLE "evaluations"
ADD CONSTRAINT "evaluations_registration_id_fkey"
FOREIGN KEY ("registration_id") REFERENCES "registrations"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
