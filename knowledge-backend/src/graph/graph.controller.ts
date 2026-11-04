import { Controller, Get, Query } from '@nestjs/common';
import { GraphService } from './graph.service';
import { GraphQueryDto, GraphSearchDto } from './dto/graph-query.dto';
import { GraphBuildService } from '../pipeline/graph-build.service';

@Controller('graph')
export class GraphController {
  constructor(private readonly graph: GraphBuildService) {}

  @Get('search')
  search(@Query() query: GraphSearchDto) {
    return this.graph.searchGraph(query.keyword, query.limit ?? 50);
  }

  @Get('nodes')
  listNodes(@Query() query: GraphQueryDto) {
    return this.graph.listNodes(query.type, query.limit ?? 200)
  }


  @Get('edges')
  listEdges(@Query() query: GraphQueryDto) {
    return this.graph.listEdges(query.limit ?? 500);
  }
}
