import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active banners' })
  @ApiResponse({ status: 200, description: 'Banners retrieved successfully' })
  async findAll() {
    return this.bannersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID' })
  @ApiResponse({ status: 200, description: 'Banner retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new banner (Admin only)' })
  @ApiResponse({ status: 201, description: 'Banner created successfully' })
  async create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner (Admin only)' })
  @ApiResponse({ status: 200, description: 'Banner updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ) {
    return this.bannersService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete banner (Admin only)' })
  @ApiResponse({ status: 200, description: 'Banner deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}


