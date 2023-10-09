import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { join } from 'path';
import { User } from './users/entities/users.entity'
import { Message } from './chat/entities/message.entity'
import { GroupMember } from './chat/entities/group_member.entity'
import { Conversation } from './chat/entities/conversation.entity'
import { Friendship } from './users/entities/friendship.entity';
import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';

//We set the synchronize option to true, which means that TypeORM will automatically
//generate database tables based on the entities. However, this option should be used
//with caution in production because it can cause data loss and conflicts.

dotenv.config();

const dbPass = process.env.DB_PASSWORD;
const dbUsername = process.env.DB_USERNAME;
const dbName = process.env.DB_NAME;
const dbHost = process.env.HOSTNAME;

@Module({
  imports: [

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: dbHost,
      port: 5432,
      username: dbUsername,
      password: dbPass,
      database: dbName,
      entities: [User, Message, GroupMember, Conversation, Friendship],
      synchronize: true,
      autoLoadEntities: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'client'),
    }),

    AuthModule,

    UsersModule,

    ChatModule,

  ],
  controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
