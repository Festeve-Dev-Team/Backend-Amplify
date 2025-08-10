import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Banner, BannerDocument } from './schemas/banner.schema';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<BannerDocument> {
    const banner = new this.bannerModel(createBannerDto);
    return banner.save();
  }

  async findAll(): Promise<BannerDocument[]> {
    return this.bannerModel
      .find({ isActive: true })
      .sort({ position: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<BannerDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid banner ID');
    }

    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async update(
    id: string,
    updateBannerDto: UpdateBannerDto,
  ): Promise<BannerDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid banner ID');
    }

    const banner = await this.bannerModel
      .findByIdAndUpdate(
        id,
        { ...updateBannerDto, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .exec();

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid banner ID');
    }

    const result = await this.bannerModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Banner not found');
    }
  }
}


