import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { MessagesModule } from './messages/messages.module';
import { PresenceModule } from './presence/presence.module';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeModule } from './realtime/realtime.module';
import { SearchModule } from './search/search.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SearchModule,
    ChatsModule,
    MessagesModule,
    UploadsModule,
    RealtimeModule,
    PresenceModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}

