import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './file.entity';
import { Repository } from 'typeorm';
import { GoogleDriveService } from '../integrations/google-drive/google-drive.service';

@Injectable()
export class FilesService implements OnModuleInit {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(FileEntity)
    private fileRepo: Repository<FileEntity>,
    private readonly driveService: GoogleDriveService,
  ) {}

  async handleUploadRequest(urls: string[]) {
    const files = urls.map((url) =>
      this.fileRepo.create({ originalUrl: url, status: 'pending' }),
    );
    return this.fileRepo.save(files);
  }

  async getFiles() {
    return this.fileRepo.find({ order: { createdAt: 'ASC' } });
  }

  async findPending(limit = 10): Promise<FileEntity[]> {
    return this.fileRepo.find({
      where: { status: 'pending' },
      take: limit,
    });
  }

  async markAsInProgress(id: number) {
    await this.fileRepo.update(id, { status: 'in_progress' });
  }

  async markAsCompleted(id: number, driveUrl: string) {
    await this.fileRepo.update(id, { status: 'completed', driveUrl });
  }

  async markAsFailed(id: number) {
    await this.fileRepo.update(id, { status: 'failed' });
  }

  async processPendingFiles() {
    const pendingFiles = await this.findPending();

    for (const file of pendingFiles) {
      try {
        await this.markAsInProgress(file.id);

        const url = file.originalUrl;
        const filename = url.split('/').pop() || 'unknown-file';
        const driveUrl = await this.driveService.uploadFileFromUrl(
          file.originalUrl,
          filename,
        );
        await this.markAsCompleted(file.id, driveUrl);
        this.logger.log(`File ${file.id} uploaded successfully`);
      } catch (error: unknown) {
        const err = <Error>error;
        await this.markAsFailed(file.id);
        this.logger.error(`Failed to upload file ${file.id}: ${err.message}`);
      }
    }
  }

  onModuleInit() {
    this.logger.log('Starting upload polling every 10s');

    setInterval(() => {
      void this.processPendingFiles();
    }, 10_000);
  }
}
