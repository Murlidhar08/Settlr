-- CreateTable
CREATE TABLE "transaction_document" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER,
    "file_type" TEXT,
    "document_relative_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_transaction_document_transaction_id" ON "transaction_document"("transaction_id");

-- AddForeignKey
ALTER TABLE "transaction_document" ADD CONSTRAINT "fk_transaction_document_transaction_id" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
