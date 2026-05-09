-- CreateIndex
CREATE INDEX "registrations_created_at_idx" ON "registrations"("created_at");

-- CreateIndex
CREATE INDEX "registrations_status_created_at_idx" ON "registrations"("status", "created_at");

-- CreateIndex
CREATE INDEX "registrations_payment_status_created_at_idx" ON "registrations"("payment_status", "created_at");

-- CreateIndex
CREATE INDEX "registrations_event_id_idx" ON "registrations"("event_id");

-- CreateIndex
CREATE INDEX "registrations_class_group_id_idx" ON "registrations"("class_group_id");
