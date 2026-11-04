import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateDocumentDto } from './create-document.dto';

export class UpdateDocumentDto extends PartialType(
  OmitType(CreateDocumentDto, ['createBy'] as const)
) {
  /** 更新人 ID */
  @IsOptional()
  @IsString()
  updateBy?: string;
}