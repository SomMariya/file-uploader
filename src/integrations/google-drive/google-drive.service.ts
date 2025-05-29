import { Injectable, Logger } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import axios from 'axios';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private driveClient: drive_v3.Drive;
  private folderId: string;

  constructor() {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_DRIVE_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive.file'],
    );

    this.driveClient = google.drive({ version: 'v3', auth });
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
  }

  async uploadFileFromUrl(url: string, filename: string): Promise<string> {
    try {
      const response = await axios.get(url, { responseType: 'stream' });

      const MAX_FILE_SIZE = 50 * 1024 * 1024;
      const fileSize = Number(response.headers['content-length']);

      if (fileSize > MAX_FILE_SIZE) {
        throw new Error(
          `File size ${fileSize} bytes exceeds the max limit of ${MAX_FILE_SIZE} bytes`,
        );
      }

      const fileMetadata = {
        name: filename,
        parents: this.folderId ? [this.folderId] : [],
      };
      const media = {
        mimeType: <string>response.headers['content-type'],
        body: <Readable>response.data,
      };

      const res = await this.driveClient.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, webViewLink',
      });

      return res.data.webViewLink!;
    } catch (error: unknown) {
      const err = <Error>error;
      this.logger.error(`Failed to upload file: ${err.message}`);
      throw error;
    }
  }
}
