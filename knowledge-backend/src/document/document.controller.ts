import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadParseDto } from './dto/upload-parse.dto';
import { QueryReviewTasksDto, ReviewDecisionDto } from './dto/review.dto';
import { DocumentReviewService } from './document-review.service';
import { CurrentUser } from '../auth/decorators.ts/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.interface';
import { RoleCode } from '../common/constants/roles';
import { Roles } from '../auth/decorators.ts/roles.decorator';
import { PermissionCode } from '../common/constants/permissions';
import { RequirePermission } from '../auth/decorators.ts/require-permission.decorator';

@Controller('documents')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly reviewService: DocumentReviewService,
  ) {}

  @Post()
  @RequirePermission(PermissionCode.documentCreate)
  create(@Body() dto: CreateDocumentDto, @CurrentUser() user: AuthUser) {
    return this.documentService.create(dto, user);
  }
  
  /** 上传文件并解析为 Markdown，创建草稿（form-data 字段名: file） */
  @Post('upload/parse')
  @RequirePermission(PermissionCode.documentCreate)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  uploadAndParse(
    @UploadedFile() file: Express.Multer.File,
    @Body() meta: UploadParseDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) {
      throw new BadRequestException('请上传文件（form-data 字段名: file）');
    }
    return this.documentService.uploadAndCreateDocument(file, meta, user);
  }




  @Put(':id/publish')
  @RequirePermission(PermissionCode.documentEdit)
  publish(@Param('id') id: string) {
    console.log('111')
    return this.documentService.publish(id);
  }

  /** 单独提交审核（也可由 publish 在需审核时内部调用） */
  @Post(':id/reviews/submit')
  @RequirePermission(PermissionCode.documentEdit)
  submitReview(@Param('id') id: string) {
    return this.reviewService.submitForReview(id);
  }

  /** 当前待审记录（review_result IS NULL） */
  @Get(':id/reviews/current')
  @RequirePermission(
    PermissionCode.documentList,
    PermissionCode.documentReview,
  )
  getCurrentReview(@Param('id') id: string) {
    return this.reviewService.getCurrentReview(id);
  }

  /** 该文档全部审核历史，按 created_at 倒序 */
  @Get(':id/reviews/history')
  @RequirePermission(
    PermissionCode.documentList,
    PermissionCode.documentReview,
  )
  getReviewHistory(@Param('id') id: string) {
    return this.reviewService.getReviewHistory(id);
  }

  /** 审核通过 → 文档 Published + 重建索引 */
  @Post('reviews/tasks/:taskId/approve')
  @Roles(RoleCode.REVIEWER, RoleCode.ADMIN)
  @RequirePermission(PermissionCode.documentReview)
  approveReview(
    @Param('taskId') taskId: string,
    @Body() dto: ReviewDecisionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reviewService.approveReview(
      taskId,
      dto.reviewerId,
      user.realName ?? user.username,
      dto.reviewComment,
    );
  }

  /** 审核驳回 → 文档回 Draft，作者可修改后再次 submit */
  @Post('reviews/tasks/:taskId/reject')
  @Roles(RoleCode.REVIEWER, RoleCode.ADMIN)
  @RequirePermission(PermissionCode.documentReview)
  rejectReview(
    @Param('taskId') taskId: string,
    @Body() dto: ReviewDecisionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reviewService.rejectReview(
      taskId,
      dto.reviewComment ?? '',
      user.userId,
      user.realName ?? user.username,
    );
  }

  /** 审核待办列表（须在 @Get(':id') 之前注册，避免路由被 :id 吃掉） */
  @Get('reviews/tasks')
  @Roles(RoleCode.REVIEWER, RoleCode.ADMIN)
  @RequirePermission(PermissionCode.documentReview)
  listReviewTasks(@Query() query: QueryReviewTasksDto) {
    return this.reviewService.listTasks(query);
  }

  @Get('reviews/tasks/pending-count')
  @Roles(RoleCode.REVIEWER, RoleCode.ADMIN)
  @RequirePermission(PermissionCode.documentReview)
  pendingReviewCount() {
    return this.reviewService.getPendingCount();
  }


  /** 归档：Published → Archived，并清 RAG/Search/KG 索引 */
  @Put(':id/archive')
  @RequirePermission(PermissionCode.documentEdit)
  archive(@Param('id') id: string) {
    return this.documentService.archive(id);
  }

  /** 下架编辑：Published → Draft，清索引后可改内容再提审/发布 */
  @Put(':id/save-draft')
  @RequirePermission(PermissionCode.documentEdit)
  saveAsDraft(@Param('id') id: string) {
    return this.documentService.saveAsDraft(id);
  }

  @Get()
  @RequirePermission(PermissionCode.documentList)
  findAll(@Query() query: QueryDocumentDto) {
    return this.documentService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PermissionCode.documentList)
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @CurrentUser() user: AuthUser) {
    return this.documentService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
