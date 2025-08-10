import {
  Controller,
  Get,
  Patch,
  Body,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminSettingsService } from './admin-settings.service';
import { UpdateAdminSettingsDto } from './dto/update-admin-settings.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';

@ApiTags('Admin Settings')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get admin settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getSettings() {
    return this.adminSettingsService.getSettings();
  }

  @Patch()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update admin settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@Body() updateAdminSettingsDto: UpdateAdminSettingsDto) {
    return this.adminSettingsService.updateSettings(updateAdminSettingsDto);
  }

  @Patch('homepage-sections/:key')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a homepage section (Admin only)' })
  @ApiResponse({ status: 200, description: 'Homepage section updated' })
  async updateHomepageSection(@Param('key') key: string, @Body() sectionData: any) {
    return this.adminSettingsService.updateHomepageSection(key, sectionData);
  }

  @Post('banners')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new banner (Admin only)' })
  @ApiResponse({ status: 201, description: 'Banner added successfully' })
  async addBanner(@Body() bannerData: any) {
    return this.adminSettingsService.addBanner(bannerData);
  }

  @Patch('banners/:index')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a banner (Admin only)' })
  @ApiResponse({ status: 200, description: 'Banner updated successfully' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async updateBanner(@Param('index', ParseIntPipe) index: number, @Body() bannerData: any) {
    return this.adminSettingsService.updateBanner(index, bannerData);
  }

  @Delete('banners/:index')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a banner (Admin only)' })
  @ApiResponse({ status: 200, description: 'Banner removed successfully' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async removeBanner(@Param('index', ParseIntPipe) index: number) {
    return this.adminSettingsService.removeBanner(index);
  }

  @Patch('banners/reorder')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder banners (Admin only)' })
  @ApiResponse({ status: 200, description: 'Banners reordered successfully' })
  async reorderBanners(@Body() body: { newOrder: number[] }) {
    return this.adminSettingsService.reorderBanners(body.newOrder);
  }

  @Get('banners/active')
  @ApiOperation({ summary: 'Get active banners for public display' })
  @ApiResponse({ status: 200, description: 'Active banners retrieved' })
  async getActiveBanners() {
    return this.adminSettingsService.getActiveBanners();
  }

  @Get('homepage-sections/enabled')
  @ApiOperation({ summary: 'Get enabled homepage sections for public display' })
  @ApiResponse({ status: 200, description: 'Enabled sections retrieved' })
  async getEnabledHomepageSections() {
    return this.adminSettingsService.getEnabledHomepageSections();
  }
}


