import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { VendorsClient } from '../clients/vendors.client';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private vendorsClient: VendorsClient,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    // Validate variants
    this.validateVariants(createProductDto.variants);
    
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(query: ProductQueryDto) {
    const {
      search,
      category,
      tags,
      isHotItem,
      ingredients,
      vendorId,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    // Build filter
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { ingredients: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      if (Types.ObjectId.isValid(category)) {
        filter.category = category;
      }
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (isHotItem !== undefined) {
      filter.isHotItem = isHotItem;
    }

    if (ingredients && ingredients.length > 0) {
      filter.ingredients = { $in: ingredients };
    }

    if (vendorId) {
      if (Types.ObjectId.isValid(vendorId)) {
        filter.vendorId = vendorId;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter['variants.price'] = {};
      if (minPrice !== undefined) {
        filter['variants.price'].$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter['variants.price'].$lte = maxPrice;
      }
    }

    // Build sort
    const sort: any = {};
    if (sortBy === 'price') {
      sort['variants.0.price'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', 'name slug')
        .populate('linkedEvents', 'name date')
        .populate('vendors', 'name averageRating')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTrending() {
    return this.productModel
      .find({ isTrending: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel
      .findById(id)
      .populate('category', 'name slug')
      .populate('linkedEvents', 'name date type')
      .populate('vendors', 'name averageRating ratings')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    // Validate variants if provided
    if (updateProductDto.variants) {
      this.validateVariants(updateProductDto.variants);
    }

    const product = await this.productModel
      .findByIdAndUpdate(
        id,
        { ...updateProductDto, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .populate('category', 'name slug')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async checkVariantStock(productId: string, variantId: string): Promise<number> {
    const product = await this.findOne(productId);
    const variant = product.variants.find(v => (v as any)._id?.toString() === variantId);
    
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (!variant.isActive) {
      throw new BadRequestException('Product variant is not active');
    }

    return variant.stock;
  }

  async reserveStock(
    productId: string,
    variantId: string,
    quantity: number,
    session?: any,
  ): Promise<void> {
    const updateResult = await this.productModel.updateOne(
      {
        _id: productId,
        'variants._id': variantId,
        'variants.stock': { $gte: quantity },
        'variants.isActive': true,
      },
      {
        $inc: { 'variants.$.stock': -quantity },
        updatedAt: new Date(),
      },
      { session }
    );

    if (updateResult.matchedCount === 0) {
      throw new BadRequestException('Insufficient stock or variant not found');
    }
  }

  private validateVariants(variants: any[]) {
    if (!variants || variants.length === 0) {
      throw new BadRequestException('At least one variant is required');
    }

    const skus = variants.map(v => v.sku).filter(Boolean);
    const uniqueSkus = [...new Set(skus)];
    
    if (skus.length !== uniqueSkus.length) {
      throw new BadRequestException('Variant SKUs must be unique');
    }

    for (const variant of variants) {
      if (variant.price <= 0) {
        throw new BadRequestException('Variant price must be positive');
      }
      if (variant.stock < 0) {
        throw new BadRequestException('Variant stock cannot be negative');
      }
    }
  }

  async addVendors(productId: string, vendorIds: string[], auth?: string): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(
        productId,
        { $addToSet: { vendors: { $each: vendorIds } } },
        { new: true }
      )
      .populate('category', 'name')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Notify vendors service about product assignment
    for (const vendorId of vendorIds) {
      try {
        await this.vendorsClient.addProductToVendor(vendorId, productId, auth);
      } catch (error) {
        // Log error but don't fail the entire operation
        console.warn(`Failed to update vendor ${vendorId} with product ${productId}:`, error);
      }
    }

    return product;
  }

  async removeVendors(productId: string, vendorIds: string[], auth?: string): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(
        productId,
        { $pull: { vendors: { $in: vendorIds } } },
        { new: true }
      )
      .populate('category', 'name')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Notify vendors service about product removal
    for (const vendorId of vendorIds) {
      try {
        await this.vendorsClient.removeProductFromVendor(vendorId, productId, auth);
      } catch (error) {
        // Log error but don't fail the entire operation
        console.warn(`Failed to remove product ${productId} from vendor ${vendorId}:`, error);
      }
    }

    return product;
  }

  async getVendors(productId: string, auth?: string) {
    const product = await this.productModel
      .findById(productId)
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Get detailed vendor info from vendors service
    const vendorDetails = [];
    for (const vendorId of product.vendors) {
      try {
        const vendor = await this.vendorsClient.findOne(vendorId.toString(), auth);
        vendorDetails.push(vendor);
      } catch (error) {
        console.warn(`Failed to get vendor details for ${vendorId}:`, error);
      }
    }

    return vendorDetails;
  }
}


