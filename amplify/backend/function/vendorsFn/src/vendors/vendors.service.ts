import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AddVendorRatingDto } from './dto/add-vendor-rating.dto';
import { ProductsClient } from '../clients/products.client';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    private productsClient: ProductsClient,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    try {
      const vendor = new this.vendorModel(createVendorDto);
      return await vendor.save();
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new BadRequestException('Vendor with this name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.vendorModel
      .find()
      .populate('productIds', 'name description tags isHotItem')
      .exec();
  }

  async findOne(id: string): Promise<Vendor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor ID');
    }

    const vendor = await this.vendorModel
      .findById(id)
      .populate('productIds', 'name description tags isHotItem variants')
      .exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor ID');
    }

    const vendor = await this.vendorModel
      .findByIdAndUpdate(id, updateVendorDto, { new: true, runValidators: true })
      .populate('productIds', 'name description tags isHotItem')
      .exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor ID');
    }

    const result = await this.vendorModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
  }

  async addRating(id: string, userId: string, addRatingDto: AddVendorRatingDto): Promise<Vendor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor ID');
    }

    const vendor = await this.vendorModel.findById(id).exec();
    
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    // Check if user has already rated this vendor
    const existingRating = vendor.ratings.find(
      rating => rating.userId.toString() === userId
    );

    if (existingRating) {
      throw new BadRequestException('You have already rated this vendor');
    }

    vendor.ratings.push({
      userId: userId as any,
      rating: addRatingDto.rating,
      review: addRatingDto.review,
      createdAt: new Date(),
    });

    return await vendor.save();
  }

  async findByProduct(productId: string): Promise<Vendor[]> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    return this.vendorModel
      .find({ productIds: productId })
      .populate('productIds', 'name description tags isHotItem')
      .exec();
  }

  async addProductToVendor(vendorId: string, productId: string): Promise<Vendor> {
    if (!Types.ObjectId.isValid(vendorId) || !Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid vendor or product ID');
    }

    const vendor = await this.vendorModel
      .findByIdAndUpdate(
        vendorId,
        { $addToSet: { productIds: productId } },
        { new: true, runValidators: true }
      )
      .populate('productIds', 'name description tags isHotItem')
      .exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    return vendor;
  }

  async removeProductFromVendor(vendorId: string, productId: string): Promise<Vendor> {
    if (!Types.ObjectId.isValid(vendorId) || !Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid vendor or product ID');
    }

    const vendor = await this.vendorModel
      .findByIdAndUpdate(
        vendorId,
        { $pull: { productIds: productId } },
        { new: true, runValidators: true }
      )
      .populate('productIds', 'name description tags isHotItem')
      .exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    return vendor;
  }

  async addProducts(vendorId: string, productIds: string[], auth?: string): Promise<Vendor> {
    if (!Types.ObjectId.isValid(vendorId)) {
      throw new BadRequestException('Invalid vendor ID');
    }

    for (const productId of productIds) {
      if (!Types.ObjectId.isValid(productId)) {
        throw new BadRequestException(`Invalid product ID: ${productId}`);
      }
    }

    const vendor = await this.vendorModel
      .findByIdAndUpdate(
        vendorId,
        { $addToSet: { productIds: { $each: productIds } } },
        { new: true, runValidators: true }
      )
      .populate('productIds', 'name description tags isHotItem')
      .exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Notify products service about vendor assignment
    for (const productId of productIds) {
      try {
        await this.productsClient.addVendors(productId, [vendorId], auth);
      } catch (error) {
        console.warn(`Failed to update product ${productId} with vendor ${vendorId}:`, error);
      }
    }

    return vendor;
  }

  async removeProducts(vendorId: string, productIds: string[], auth?: string): Promise<Vendor> {
    if (!Types.ObjectId.isValid(vendorId)) {
      throw new BadRequestException('Invalid vendor ID');
    }

    for (const productId of productIds) {
      if (!Types.ObjectId.isValid(productId)) {
        throw new BadRequestException(`Invalid product ID: ${productId}`);
      }
    }

    const vendor = await this.vendorModel
      .findByIdAndUpdate(
        vendorId,
        { $pull: { productIds: { $in: productIds } } },
        { new: true, runValidators: true }
      )
      .populate('productIds', 'name description tags isHotItem')
      .exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Notify products service about vendor removal
    for (const productId of productIds) {
      try {
        await this.productsClient.removeVendors(productId, [vendorId], auth);
      } catch (error) {
        console.warn(`Failed to remove vendor ${vendorId} from product ${productId}:`, error);
      }
    }

    return vendor;
  }

  async getProducts(vendorId: string, auth?: string) {
    if (!Types.ObjectId.isValid(vendorId)) {
      throw new BadRequestException('Invalid vendor ID');
    }

    const vendor = await this.vendorModel
      .findById(vendorId)
      .exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Get detailed product info from products service
    const productDetails = [];
    for (const productId of vendor.productIds) {
      try {
        const product = await this.productsClient.findOne(productId.toString(), auth);
        productDetails.push(product);
      } catch (error) {
        console.warn(`Failed to get product details for ${productId}:`, error);
      }
    }

    return productDetails;
  }
}


