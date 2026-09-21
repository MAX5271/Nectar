-- CreateIndex
CREATE INDEX "DietaryConstraint_userId_idx" ON "DietaryConstraint"("userId");

-- CreateIndex
CREATE INDEX "Diet_dietPlanId_idx" ON "Diet"("dietPlanId");

-- CreateIndex
CREATE INDEX "DietPlan_userId_date_idx" ON "DietPlan"("userId", "date");
