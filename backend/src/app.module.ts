import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OfficialsModule } from './officials/officials.module';
import { ChampionshipsModule } from './championships/championships.module';
import { StadiumsModule } from './stadiums/stadiums.module';
import { MatchesModule } from './matches/matches.module';
import { MatchOfficialsModule } from './match-officials/match-officials.module';
import { DrawsModule } from './draws/draws.module';
import { SubstitutionsModule } from './substitutions/substitutions.module';
import { TeamsModule } from './teams/teams.module';
import { RoomInspectionsModule } from './room-inspections/room-inspections.module';
import { PushModule } from './push/push.module';
import { InventoryModule } from './inventory/inventory.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AdminTasksModule } from './admin-tasks/admin-tasks.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PushLogsModule } from './push-logs/push-logs.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    OfficialsModule,
    ChampionshipsModule,
    StadiumsModule,
    MatchesModule,
    MatchOfficialsModule,
    DrawsModule,
    SubstitutionsModule,
    TeamsModule,
    RoomInspectionsModule,
    PushModule,
    InventoryModule,
    AnnouncementsModule,
    AdminTasksModule,
    DashboardModule,
    PushLogsModule,
    ReportsModule,
  ],
})
export class AppModule {}
