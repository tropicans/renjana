ALTER TABLE "class_groups"
ADD COLUMN "instructor_user_id" TEXT;

CREATE INDEX "class_groups_instructor_user_id_idx" ON "class_groups"("instructor_user_id");

ALTER TABLE "class_groups"
ADD CONSTRAINT "class_groups_instructor_user_id_fkey"
FOREIGN KEY ("instructor_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
