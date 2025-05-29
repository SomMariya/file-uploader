import { IsArray, ArrayNotEmpty, IsUrl } from 'class-validator';

export class CreateUploadDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  urls: string[];
}
