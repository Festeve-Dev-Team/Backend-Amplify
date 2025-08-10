import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Express } from 'express';

import { UploadService } from './upload.service';
import { AuthGuard } from '../shared/common/guards/auth.guard';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UploadController {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  constructor(private readonly uploadService: UploadService) {}

  @Post(':folder')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file to specified folder' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or folder' })
  async uploadFile(
    @Param('folder') folder: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    // Validate folder name (prevent path traversal)
    if (!/^[a-zA-Z0-9_-]+$/.test(folder)) {
      throw new BadRequestException('Invalid folder name');
    }

    const url = await this.uploadService.upload(folder, file.originalname, file.buffer);
    
    return {
      message: 'File uploaded successfully',
      url,
      filename: file.originalname,
      size: file.size,
    };
  }
}


