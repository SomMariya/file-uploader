import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUploadDto } from './dto/create-upload.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  async uploadFiles(@Body() createUploadDto: CreateUploadDto) {
    return this.filesService.handleUploadRequest(createUploadDto.urls);
  }

  @Get()
  getFiles() {
    return this.filesService.getFiles();
  }
}
