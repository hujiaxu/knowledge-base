import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SearchDocumentsDto } from './dto/search.dto';
import { RequirePermission } from '../auth/decorators.ts/require-permission.decorator';
import { PermissionCode } from '../common/constants/permissions';
import { SearchIndexService } from '../pipeline/search-index.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchIndex: SearchIndexService) {}

  @Post()
  @RequirePermission(PermissionCode.search)
  search(@Body() dto: SearchDocumentsDto) {
    return this.searchIndex.searchDocuments({
      keyword: dto.keyword,
      page: dto.page,
      pageSize: dto.pageSize,
      categoryId: dto.categoryId,
      authorId: dto.authorId,
    });
  }
}
