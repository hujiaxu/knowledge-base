import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { MongooseModule } from '@nestjs/mongoose'
import {
  DocumentContent,
  DocumentContentSchema,
} from './schemas/document-content.schema';
import { FileParserService } from './parser/file-parser.service';
import { DocumentReviewService } from './document-review.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentContent.name, schema: DocumentContentSchema }
    ])
  ],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentReviewService, FileParserService],
  exports: [DocumentService, DocumentReviewService, FileParserService]
})
export class DocumentModule {}
