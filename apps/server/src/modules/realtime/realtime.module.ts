import { Module } from '@nestjs/common';
import { ChatsModule } from '../chats/chats.module';
import { PresenceModule } from '../presence/presence.module';
import { RealtimeGateway } from './realtime.gateway';
import { WsAuthGuard } from './ws-auth.guard';

@Module({
  imports: [PresenceModule, ChatsModule],
  providers: [RealtimeGateway, WsAuthGuard],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}

