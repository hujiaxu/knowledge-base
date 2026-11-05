import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiChatService } from './ai-chat.service';
import { HybridRetrievalService } from './hybrid-retrieval.service';
import { RerankerService } from './reranker.service';
import { PipelineModule } from '../pipeline/pipeline.module';
import { ChatSessionService } from './chat-session.service';
import { AiStreamService } from './ai-stream.service';
import { WebSearchService } from './web-search.service';

@Module({
  imports: [PipelineModule],
  controllers: [AiController],
  providers: [AiChatService, HybridRetrievalService, RerankerService, ChatSessionService, AiStreamService, 
    WebSearchService
  ],
})
export class AiModule {}
