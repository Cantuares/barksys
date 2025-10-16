import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { I18nModule, AcceptLanguageResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SessionsModule } from './modules/auth/sessions/sessions.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { MediaModule } from './modules/media/media.module';
import { TrainersModule } from './modules/trainers/trainers.module';
import { TutorsModule } from './modules/tutors/tutors.module';
import { PetsModule } from './modules/pets/pets.module';
import { PackagesModule } from './modules/packages/packages.module';
import { TrainingSessionTemplatesModule } from './modules/training-session-templates/training-session-templates.module';
import { TrainingSessionsModule } from './modules/training-sessions/training-sessions.module';
import { TrainingSessionEnrollmentsModule } from './modules/training-session-enrollments/training-session-enrollments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { I18nHttpModule } from './i18n/i18n.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../i18n/locales/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-custom-lang']),
      ],
    }),
    MikroOrmModule.forRoot(databaseConfig()),
    AuthModule,
    UsersModule,
    SessionsModule,
    CompaniesModule,
    TrainersModule,
    TutorsModule,
    PetsModule,
    PackagesModule,
    TrainingSessionTemplatesModule,
    TrainingSessionsModule,
    TrainingSessionEnrollmentsModule,
    DashboardModule,
    MediaModule,
    NotificationsModule,
    I18nHttpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
