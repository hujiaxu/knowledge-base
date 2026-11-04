import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { PipelineModule } from '../pipeline/pipeline.module';

@Module({
  imports: [PipelineModule],
  controllers: [SearchController],
})
export class SearchModule {}
