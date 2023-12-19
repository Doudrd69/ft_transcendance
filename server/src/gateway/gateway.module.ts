import { Module } from '@nestjs/common'
import { GeneralGateway } from './gateway';
import { ChatModule } from 'src/chat/chat.module';
import { ChatService } from 'src/chat/chat.service';

@Module({
    imports: [ChatModule],
    providers: [GeneralGateway],
})
export class GatewayModule {}