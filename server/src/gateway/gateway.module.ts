import { Module } from '@nestjs/common'
import { GeneralGateway } from './gateway';

@Module({
    providers: [GeneralGateway],
})
export class GatewayModule {}

