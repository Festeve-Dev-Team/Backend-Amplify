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
} from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialQueryDto } from './dto/testimonial-query.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';
import { User } from '../shared/common/decorators/user.decorator';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new testimonial' })
  @ApiResponse({ status: 201, description: 'Testimonial created successfully' })
  @ApiResponse({ status: 400, description: 'User already has a testimonial' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @User('sub') userId: string,
    @Body() createTestimonialDto: CreateTestimonialDto,
  ) {
    return this.testimonialsService.create(userId, createTestimonialDto);
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all testimonials with filtering (Admin only)' })
  @ApiResponse({ status: 200, description: 'Testimonials retrieved successfully' })
  async findAll(@Query() query: TestimonialQueryDto) {
    return this.testimonialsService.findAll(query);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get approved testimonials for public display' })
  @ApiResponse({ status: 200, description: 'Public testimonials retrieved' })
  async findPublic() {
    return this.testimonialsService.findPublic();
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get testimonial statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStats() {
    return this.testimonialsService.getStats();
  }

  @Get(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a testimonial by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Testimonial retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  async findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own testimonial' })
  @ApiResponse({ status: 200, description: 'Testimonial updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update approved testimonials' })
  @ApiResponse({ status: 403, description: 'Can only update own testimonials' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  async update(
    @Param('id') id: string,
    @User('sub') userId: string,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
  ) {
    return this.testimonialsService.update(id, userId, updateTestimonialDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own testimonial' })
  @ApiResponse({ status: 204, description: 'Testimonial deleted successfully' })
  @ApiResponse({ status: 403, description: 'Can only delete own testimonials' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  async remove(@Param('id') id: string, @User('sub') userId: string) {
    return this.testimonialsService.remove(id, userId);
  }

  @Patch(':id/approve')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a testimonial (Admin only)' })
  @ApiResponse({ status: 200, description: 'Testimonial approved' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  async approve(@Param('id') id: string) {
    return this.testimonialsService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a testimonial (Admin only)' })
  @ApiResponse({ status: 200, description: 'Testimonial rejected' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  async reject(@Param('id') id: string) {
    return this.testimonialsService.reject(id);
  }

  @Patch(':id/verify')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a testimonial (Admin only)' })
  @ApiResponse({ status: 200, description: 'Testimonial verified' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  async verify(@Param('id') id: string) {
    return this.testimonialsService.verify(id);
  }

  @Delete(':id/admin')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete any testimonial (Admin only)' })
  @ApiResponse({ status: 204, description: 'Testimonial deleted successfully' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  async adminRemove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}


