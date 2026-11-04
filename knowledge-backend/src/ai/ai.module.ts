import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiChatService } from './ai-chat.service';
import { HybridRetrievalService } from './hybrid-retrieval.service';
import { RerankerService } from './reranker.service';
import { PipelineModule } from '../pipeline/pipeline.module';

@Module({
  imports: [PipelineModule],
  controllers: [AiController],
  providers: [AiChatService, HybridRetrievalService, RerankerService],
})
export class AiModule {}
