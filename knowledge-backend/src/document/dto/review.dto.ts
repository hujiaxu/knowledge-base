import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryReviewTasksDto {
  /** 筛选：pending 待办 | approved 已通过 | rejected 已驳回；默认 pending */
  @IsOptional()
  @IsString()
  status?: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

/**
 * 审核通过 / 驳回请求体
 * reviewerId、reviewerName 暂由前端传入；接入鉴权后改从登录用户取
 */

export class ReviewDecisionDto {
  @IsOptional()
  @IsString()
  reviewComment?: string;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  reviewerName?: string;
}