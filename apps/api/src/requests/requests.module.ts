import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationRecord } from './entities/classification-record.entity';
import { CLASSIFICATION_REPOSITORY } from './repositories/classification-repository';
import { ClassificationService } from './services/classification.service';
import { CLASSIFIER_PROVIDER } from './classifiers/classifier-provider';
import { CustomerRequest } from './entities/customer-request.entity';
import { RequestNote } from './entities/request-note.entity';
import { RequestsController } from './controllers/requests.controller';
import { RequestsService } from './services/requests.service';
import { KeywordClassifier } from './classifiers/keyword-classifier';
import { TypeOrmClassificationRepository } from './repositories/typeorm-classification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerRequest, RequestNote, ClassificationRecord])],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    ClassificationService,
    { provide: CLASSIFIER_PROVIDER, useClass: KeywordClassifier },
    { provide: CLASSIFICATION_REPOSITORY, useClass: TypeOrmClassificationRepository },
  ],
})
export class RequestsModule {}