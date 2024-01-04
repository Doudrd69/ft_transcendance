import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from 'src/chat/chat.module';
import { User } from './entities/users.entity';
import { Friendship } from './entities/friendship.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Friendship]),
    ChatModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
