import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  content: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  topK?: number = 5
}