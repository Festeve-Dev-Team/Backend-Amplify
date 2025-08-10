import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new offer (Admin only)' })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  async create(@Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(createOfferDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all offers' })
  @ApiQuery({ name: 'appliesTo', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Offers retrieved successfully' })
  async findAll(
    @Query('appliesTo') appliesTo?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.offersService.findAll(appliesTo, isActive);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get currently active offers' })
  @ApiResponse({ status: 200, description: 'Active offers retrieved' })
  async findActive() {
    return this.offersService.findActive();
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get offer statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStats() {
    return this.offersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an offer by ID' })
  @ApiResponse({ status: 200, description: 'Offer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an offer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Offer updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async update(@Param('id') id: string, @Body() updateOfferDto: Partial<CreateOfferDto>) {
    return this.offersService.update(id, updateOfferDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an offer (Admin only)' })
  @ApiResponse({ status: 204, description: 'Offer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }

  @Patch(':id/activate')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate an offer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Offer activated' })
  async activate(@Param('id') id: string) {
    return this.offersService.activate(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate an offer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Offer deactivated' })
  async deactivate(@Param('id') id: string) {
    return this.offersService.deactivate(id);
  }
}


