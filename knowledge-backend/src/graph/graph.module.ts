import { Module } from '@nestjs/common';
import { GraphService } from './graph.service';
import { GraphController } from './graph.controller';
import { PipelineModule } from '../pipeline/pipeline.module';

@Module({
  imports: [PipelineModule],
  controllers: [GraphController],
})
export class GraphModule {}
