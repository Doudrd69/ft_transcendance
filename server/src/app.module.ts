import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { User } from './users/entities/users.entity'
import { Message } from './chat/entities/message.entity'
import { Conversation } from './chat/entities/conversation.entity'
import { Friendship } from './users/entities/friendship.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { GatewayModule } from './gateway/gateway.module';
import { GameGateway } from './game/game.gateway';
<<<<<<< HEAD
=======
import { AppService } from './app.service';
>>>>>>> 7542649 (add lobby, try to access)
import { GameModule } from './game/game.module';

//We set the synchronize option to true, which means that TypeORM will automatically
//generate database tables based on the entities. However, this option should be used
//with caution in production because it can cause data loss and conflicts.

dotenv.config();

const dbPass = process.env.POSTGRES_PASSWORD;
const dbUsername = process.env.DB_USERNAME;
const dbName = process.env.DB_NAME;
const dbHost = process.env.HOSTNAME;

if (!dbPass || !dbUsername || !dbName || !dbHost) {
  throw new Error('One or more required environment variables are missing.');
}


if (!dbPass || !dbUsername || !dbName || !dbHost) {
  throw new Error('One or more required environment variables are missing.');
}


@Module({
	
  imports: [

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: dbHost,
      port: 5432,
      username: dbUsername,
      password: dbPass,
      database: dbName,
      entities: [User, Message, Conversation, Friendship],
      synchronize: true,
      autoLoadEntities: true,
    }),

    AuthModule,

    UsersModule,

    ChatModule,

    GatewayModule,

    GameModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
