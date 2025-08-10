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
import { PurohitsService } from './purohits.service';
import { CreatePurohitDto } from './dto/create-purohit.dto';
import { UpdatePurohitDto } from './dto/update-purohit.dto';
import { AddRatingDto } from './dto/add-rating.dto';
import { PurohitQueryDto } from './dto/purohit-query.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';
import { User } from '../shared/common/decorators/user.decorator';

@ApiTags('Purohits')
@Controller('purohits')
export class PurohitsController {
  constructor(private readonly purohitsService: PurohitsService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new purohit (Admin only)' })
  @ApiResponse({ status: 201, description: 'Purohit created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createPurohitDto: CreatePurohitDto) {
    return this.purohitsService.create(createPurohitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purohits with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Purohits retrieved successfully' })
  async findAll(@Query() query: PurohitQueryDto) {
    return this.purohitsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purohit by ID' })
  @ApiResponse({ status: 200, description: 'Purohit retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Purohit not found' })
  async findOne(@Param('id') id: string) {
    return this.purohitsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a purohit (Admin only)' })
  @ApiResponse({ status: 200, description: 'Purohit updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Purohit not found' })
  async update(@Param('id') id: string, @Body() updatePurohitDto: UpdatePurohitDto) {
    return this.purohitsService.update(id, updatePurohitDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a purohit (Admin only)' })
  @ApiResponse({ status: 204, description: 'Purohit deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Purohit not found' })
  async remove(@Param('id') id: string) {
    return this.purohitsService.remove(id);
  }

  @Post(':id/rating')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add rating to a purohit' })
  @ApiResponse({ status: 201, description: 'Rating added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or already rated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Purohit not found' })
  async addRating(
    @Param('id') id: string,
    @User('sub') userId: string,
    @Body() addRatingDto: AddRatingDto,
  ) {
    return this.purohitsService.addRating(id, userId, addRatingDto);
  }

  @Patch(':id/availability')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update purohit availability (Admin only)' })
  @ApiResponse({ status: 200, description: 'Availability updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Purohit not found' })
  async updateAvailability(@Param('id') id: string, @Body() availability: any[]) {
    return this.purohitsService.updateAvailability(id, availability);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate/Deactivate purohit (Admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Purohit not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.purohitsService.activateDeactivate(id, body.isActive);
  }

  @Get('by-rituals/:rituals')
  @ApiOperation({ summary: 'Find purohits by specific rituals' })
  @ApiQuery({ name: 'pincode', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Purohits found by rituals' })
  async findByRituals(
    @Param('rituals') rituals: string,
    @Query('pincode') pincode?: string,
  ) {
    const ritualArray = rituals.split(',');
    return this.purohitsService.findByRituals(ritualArray, pincode);
  }

  @Get('by-languages/:languages')
  @ApiOperation({ summary: 'Find purohits by languages they speak' })
  @ApiQuery({ name: 'pincode', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Purohits found by languages' })
  async findByLanguages(
    @Param('languages') languages: string,
    @Query('pincode') pincode?: string,
  ) {
    const languageArray = languages.split(',');
    return this.purohitsService.findByLanguages(languageArray, pincode);
  }

  @Get('by-commission/:type')
  @ApiOperation({ summary: 'Find purohits by commission type' })
  @ApiResponse({ status: 200, description: 'Purohits found by commission type' })
  async findByCommissionType(
    @Param('type') type: 'percentage' | 'flat',
  ) {
    return this.purohitsService.findByCommissionType(type);
  }
}


