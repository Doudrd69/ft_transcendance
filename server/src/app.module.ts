import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { User } from './users/users.entity'
import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

//We set the synchronize option to true, which means that TypeORM will automatically
//generate database tables based on the entities. However, this option should be used
//with caution in production because it can cause data loss and conflicts.

@Module({
  imports: [

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [User],
      synchronize: true,
      autoLoadEntities: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'client'),
    }),

    AuthModule,

    UsersModule,

  ],
  controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
