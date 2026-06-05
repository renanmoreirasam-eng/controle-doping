-- CreateIndex
CREATE INDEX "AdminTask_done_dueDate_idx" ON "AdminTask"("done", "dueDate");

-- CreateIndex
CREATE INDEX "AdminTask_createdByUserId_idx" ON "AdminTask"("createdByUserId");

-- CreateIndex
CREATE INDEX "Announcement_active_idx" ON "Announcement"("active");

-- CreateIndex
CREATE INDEX "Announcement_targetRole_idx" ON "Announcement"("targetRole");

-- CreateIndex
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");

-- CreateIndex
CREATE INDEX "AnnouncementAcknowledgement_userId_idx" ON "AnnouncementAcknowledgement"("userId");

-- CreateIndex
CREATE INDEX "AnnouncementAcknowledgement_acknowledgedAt_idx" ON "AnnouncementAcknowledgement"("acknowledgedAt");

-- CreateIndex
CREATE INDEX "Championship_name_idx" ON "Championship"("name");

-- CreateIndex
CREATE INDEX "Draw_matchId_idx" ON "Draw"("matchId");

-- CreateIndex
CREATE INDEX "Draw_createdAt_idx" ON "Draw"("createdAt");

-- CreateIndex
CREATE INDEX "DrawPlayer_drawId_idx" ON "DrawPlayer"("drawId");

-- CreateIndex
CREATE INDEX "DrawPlayer_type_idx" ON "DrawPlayer"("type");

-- CreateIndex
CREATE INDEX "DrawPlayer_team_idx" ON "DrawPlayer"("team");

-- CreateIndex
CREATE INDEX "Kit_status_idx" ON "Kit"("status");

-- CreateIndex
CREATE INDEX "Kit_currentOfficialId_idx" ON "Kit"("currentOfficialId");

-- CreateIndex
CREATE INDEX "Kit_status_currentOfficialId_idx" ON "Kit"("status", "currentOfficialId");

-- CreateIndex
CREATE INDEX "Kit_createdAt_idx" ON "Kit"("createdAt");

-- CreateIndex
CREATE INDEX "Kit_updatedAt_idx" ON "Kit"("updatedAt");

-- CreateIndex
CREATE INDEX "KitMovement_kitId_idx" ON "KitMovement"("kitId");

-- CreateIndex
CREATE INDEX "KitMovement_type_idx" ON "KitMovement"("type");

-- CreateIndex
CREATE INDEX "KitMovement_matchId_idx" ON "KitMovement"("matchId");

-- CreateIndex
CREATE INDEX "KitMovement_fromOfficialId_idx" ON "KitMovement"("fromOfficialId");

-- CreateIndex
CREATE INDEX "KitMovement_toOfficialId_idx" ON "KitMovement"("toOfficialId");

-- CreateIndex
CREATE INDEX "KitMovement_createdAt_idx" ON "KitMovement"("createdAt");

-- CreateIndex
CREATE INDEX "KitMovement_kitId_createdAt_idx" ON "KitMovement"("kitId", "createdAt");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_matchDate_idx" ON "Match"("matchDate");

-- CreateIndex
CREATE INDEX "Match_status_matchDate_idx" ON "Match"("status", "matchDate");

-- CreateIndex
CREATE INDEX "Match_championshipId_idx" ON "Match"("championshipId");

-- CreateIndex
CREATE INDEX "Match_stadiumId_idx" ON "Match"("stadiumId");

-- CreateIndex
CREATE INDEX "Match_createdAt_idx" ON "Match"("createdAt");

-- CreateIndex
CREATE INDEX "Match_updatedAt_idx" ON "Match"("updatedAt");

-- CreateIndex
CREATE INDEX "MatchKit_matchId_idx" ON "MatchKit"("matchId");

-- CreateIndex
CREATE INDEX "MatchKit_kitId_idx" ON "MatchKit"("kitId");

-- CreateIndex
CREATE INDEX "MatchKit_officialId_idx" ON "MatchKit"("officialId");

-- CreateIndex
CREATE INDEX "MatchKit_matchId_officialId_idx" ON "MatchKit"("matchId", "officialId");

-- CreateIndex
CREATE INDEX "MatchKit_usedAt_idx" ON "MatchKit"("usedAt");

-- CreateIndex
CREATE INDEX "MatchKit_createdAt_idx" ON "MatchKit"("createdAt");

-- CreateIndex
CREATE INDEX "MatchOfficial_matchId_idx" ON "MatchOfficial"("matchId");

-- CreateIndex
CREATE INDEX "MatchOfficial_officialId_idx" ON "MatchOfficial"("officialId");

-- CreateIndex
CREATE INDEX "MatchOfficial_confirmed_idx" ON "MatchOfficial"("confirmed");

-- CreateIndex
CREATE INDEX "MatchOfficial_matchId_role_idx" ON "MatchOfficial"("matchId", "role");

-- CreateIndex
CREATE INDEX "MatchOfficial_officialId_confirmed_idx" ON "MatchOfficial"("officialId", "confirmed");

-- CreateIndex
CREATE INDEX "MatchOfficial_createdAt_idx" ON "MatchOfficial"("createdAt");

-- CreateIndex
CREATE INDEX "MatchOperationalLog_matchId_idx" ON "MatchOperationalLog"("matchId");

-- CreateIndex
CREATE INDEX "MatchOperationalLog_step_idx" ON "MatchOperationalLog"("step");

-- CreateIndex
CREATE INDEX "MatchOperationalLog_createdAt_idx" ON "MatchOperationalLog"("createdAt");

-- CreateIndex
CREATE INDEX "MatchOperationalLog_matchId_step_idx" ON "MatchOperationalLog"("matchId", "step");

-- CreateIndex
CREATE INDEX "Official_active_idx" ON "Official"("active");

-- CreateIndex
CREATE INDEX "Official_operationalRole_idx" ON "Official"("operationalRole");

-- CreateIndex
CREATE INDEX "Official_createdAt_idx" ON "Official"("createdAt");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "PushSubscription_createdAt_idx" ON "PushSubscription"("createdAt");

-- CreateIndex
CREATE INDEX "RoomInspection_matchId_idx" ON "RoomInspection"("matchId");

-- CreateIndex
CREATE INDEX "RoomInspection_status_idx" ON "RoomInspection"("status");

-- CreateIndex
CREATE INDEX "RoomInspection_createdAt_idx" ON "RoomInspection"("createdAt");

-- CreateIndex
CREATE INDEX "RoomInspectionItem_inspectionId_idx" ON "RoomInspectionItem"("inspectionId");

-- CreateIndex
CREATE INDEX "RoomInspectionItem_status_idx" ON "RoomInspectionItem"("status");

-- CreateIndex
CREATE INDEX "RoomInspectionPhoto_inspectionId_idx" ON "RoomInspectionPhoto"("inspectionId");

-- CreateIndex
CREATE INDEX "RoomInspectionPhoto_createdAt_idx" ON "RoomInspectionPhoto"("createdAt");

-- CreateIndex
CREATE INDEX "Stadium_city_idx" ON "Stadium"("city");

-- CreateIndex
CREATE INDEX "Stadium_state_idx" ON "Stadium"("state");

-- CreateIndex
CREATE INDEX "Stadium_city_state_idx" ON "Stadium"("city", "state");

-- CreateIndex
CREATE INDEX "Substitution_matchId_idx" ON "Substitution"("matchId");

-- CreateIndex
CREATE INDEX "Substitution_createdAt_idx" ON "Substitution"("createdAt");

-- CreateIndex
CREATE INDEX "Team_isActive_idx" ON "Team"("isActive");

-- CreateIndex
CREATE INDEX "Team_city_idx" ON "Team"("city");

-- CreateIndex
CREATE INDEX "Team_state_idx" ON "Team"("state");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
