import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

@Injectable()
export class UploadService {
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
  }

  async upload(folder: string, filename: string, buffer: Buffer): Promise<string> {
    try {
      // Ensure base upload directory exists
      await this.ensureDirectoryExists(this.uploadDir);

      // Ensure folder directory exists
      const folderPath = path.join(this.uploadDir, folder);
      await this.ensureDirectoryExists(folderPath);

      // Generate unique filename to prevent overwrite
      const timestamp = Date.now();
      const extension = path.extname(filename);
      const baseName = path.basename(filename, extension);
      const uniqueFilename = `${baseName}-${timestamp}${extension}`;

      // Validate and sanitize filename
      const sanitizedFilename = this.sanitizeFilename(uniqueFilename);
      const filePath = path.join(folderPath, sanitizedFilename);

      // Prevent path traversal
      if (!filePath.startsWith(folderPath)) {
        throw new BadRequestException('Invalid file path');
      }

      // Write file
      await writeFile(filePath, buffer);

      // Return accessible URL
      return `/uploads/${folder}/${sanitizedFilename}`;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to upload file');
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await access(dirPath);
    } catch {
      await mkdir(dirPath, { recursive: true });
    }
  }

  private sanitizeFilename(filename: string): string {
    // Remove any path separators and dangerous characters
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_');
  }
}


