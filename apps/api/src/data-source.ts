import { DataSource } from 'typeorm';
import { CustomerRequest } from './requests/entities/customer-request.entity';
import { RequestNote } from './requests/entities/request-note.entity';
import { ClassificationRecord } from './requests/entities/classification-record.entity';
import { InitialSchema1710000000000 } from './migrations/1710000000000-InitialSchema';
import { CreateClassifications1710000000002 } from './migrations/1710000000002-CreateClassifications';
import { AddRequestNotesLatestIndex1710000000003 } from './migrations/1710000000003-AddRequestNotesLatestIndex';

export function createDataSource() {
  return new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL ?? 'postgres://cami:cami@localhost:5432/cami',
    entities: [CustomerRequest, RequestNote, ClassificationRecord],
    migrations: [
      InitialSchema1710000000000,
      CreateClassifications1710000000002,
      AddRequestNotesLatestIndex1710000000003,
    ],
    synchronize: false,
    logging: false,
  });
}
