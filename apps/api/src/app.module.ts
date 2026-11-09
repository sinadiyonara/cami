import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsModule } from './requests/requests.module';
import { CustomerRequest } from './requests/entities/customer-request.entity';
import { RequestNote } from './requests/entities/request-note.entity';
import { ClassificationRecord } from './requests/entities/classification-record.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL ?? 'postgres://cami:cami@localhost:5432/cami',
      entities: [CustomerRequest, RequestNote, ClassificationRecord],
      synchronize: false,
      logging: ['query'],
    }),
    RequestsModule,
  ],
})
export class AppModule {}
