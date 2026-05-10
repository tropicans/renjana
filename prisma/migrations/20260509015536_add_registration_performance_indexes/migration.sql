-- CreateIndex
CREATE INDEX "courses_status_created_at_idx" ON "courses"("status", "created_at");

-- CreateIndex
CREATE INDEX "modules_course_id_order_idx" ON "modules"("course_id", "order");

-- CreateIndex
CREATE INDEX "lessons_module_id_order_idx" ON "lessons"("module_id", "order");

-- CreateIndex
CREATE INDEX "quizzes_course_id_type_idx" ON "quizzes"("course_id", "type");

-- CreateIndex
CREATE INDEX "quiz_attempts_quiz_id_user_id_completed_at_idx" ON "quiz_attempts"("quiz_id", "user_id", "completed_at");

-- CreateIndex
CREATE INDEX "events_status_is_featured_event_start_created_at_idx" ON "events"("status", "is_featured", "event_start", "created_at");

-- CreateIndex
CREATE INDEX "registration_payments_registration_id_status_created_at_idx" ON "registration_payments"("registration_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_created_at_idx" ON "audit_logs"("entity", "entity_id", "created_at");
