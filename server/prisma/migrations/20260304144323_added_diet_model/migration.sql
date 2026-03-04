-- CreateTable
CREATE TABLE "Diet" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "meal" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "carb" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diet_pkey" PRIMARY KEY ("id")
);
