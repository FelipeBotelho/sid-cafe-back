-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "estoque_atual" INTEGER NOT NULL DEFAULT 0,
    "estoque_minimo" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_categoria_id_idx" ON "products"("categoria_id");

-- CreateIndex
CREATE INDEX "products_ativo_idx" ON "products"("ativo");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
