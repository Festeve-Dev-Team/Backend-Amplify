import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AddVendorRatingDto } from './dto/add-vendor-rating.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';
import { User } from '../shared/common/decorators/user.decorator';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new vendor (Admin only)' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({ status: 200, description: 'Vendors retrieved successfully' })
  async findAll() {
    return this.vendorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor by ID' })
  @ApiResponse({ status: 200, description: 'Vendor retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid vendor ID' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a vendor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a vendor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }

  @Post(':id/rating')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add rating to a vendor' })
  @ApiResponse({ status: 201, description: 'Rating added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or already rated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async addRating(
    @Param('id') id: string,
    @User('sub') userId: string,
    @Body() addRatingDto: AddVendorRatingDto,
  ) {
    return this.vendorsService.addRating(id, userId, addRatingDto);
  }

  @Get('by-product/:productId')
  @ApiOperation({ summary: 'Find vendors by product ID' })
  @ApiResponse({ status: 200, description: 'Vendors found successfully' })
  @ApiResponse({ status: 400, description: 'Invalid product ID' })
  async findByProduct(@Param('productId') productId: string) {
    return this.vendorsService.findByProduct(productId);
  }

  @Post(':vendorId/products/:productId')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add product to vendor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product added to vendor successfully' })
  @ApiResponse({ status: 400, description: 'Invalid vendor or product ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async addProductToVendor(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
  ) {
    return this.vendorsService.addProductToVendor(vendorId, productId);
  }

  @Delete(':vendorId/products/:productId')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove product from vendor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product removed from vendor successfully' })
  @ApiResponse({ status: 400, description: 'Invalid vendor or product ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async removeProductFromVendor(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
  ) {
    return this.vendorsService.removeProductFromVendor(vendorId, productId);
  }

  @Post(':id/products')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add multiple products to vendor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Products added successfully' })
  async addProducts(
    @Param('id') id: string,
    @Body() body: { productIds: string[] },
    @Req() req: any,
  ) {
    return this.vendorsService.addProducts(id, body.productIds, req.headers.authorization);
  }

  @Delete(':id/products')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove multiple products from vendor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Products removed successfully' })
  async removeProducts(
    @Param('id') id: string,
    @Body() body: { productIds: string[] },
    @Req() req: any,
  ) {
    return this.vendorsService.removeProducts(id, body.productIds, req.headers.authorization);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get products for vendor' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts(@Param('id') id: string, @Req() req: any) {
    return this.vendorsService.getProducts(id, req.headers.authorization);
  }
}


