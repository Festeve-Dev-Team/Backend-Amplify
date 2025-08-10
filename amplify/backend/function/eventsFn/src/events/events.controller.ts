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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event (Admin only)' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s events' })
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiQuery({ name: 'regions', required: false, type: [String] })
  @ApiResponse({ status: 200, description: 'Today\'s events retrieved successfully' })
  async findToday(
    @Query('region') region?: string,
    @Query('regions') regions?: string[]
  ) {
    return this.eventsService.findToday(region, regions);
  }

  @Get('recurring')
  @ApiOperation({ summary: 'Get recurring events' })
  @ApiQuery({ 
    name: 'frequency', 
    required: false, 
    enum: ['daily', 'weekly', 'yearly'] 
  })
  @ApiResponse({ status: 200, description: 'Recurring events retrieved successfully' })
  async findRecurring(@Query('frequency') frequency?: string) {
    return this.eventsService.findRecurringEvents(frequency);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event (Admin only)' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event (Admin only)' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}


