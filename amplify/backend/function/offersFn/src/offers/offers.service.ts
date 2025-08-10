import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer, OfferDocument } from './schemas/offer.schema';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
  ) {}

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    // Validate date range
    if (new Date(createOfferDto.endDate) <= new Date(createOfferDto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    // Validate group sizes
    if (createOfferDto.minGroupSize && createOfferDto.maxGroupSize) {
      if (createOfferDto.minGroupSize > createOfferDto.maxGroupSize) {
        throw new BadRequestException('Minimum group size cannot be greater than maximum');
      }
    }

    const offer = new this.offerModel(createOfferDto);
    return await offer.save();
  }

  async findAll(appliesTo?: string, isActive?: boolean) {
    const filter: any = {};
    
    if (appliesTo) filter.appliesTo = appliesTo;
    if (isActive !== undefined) filter.isActive = isActive;

    return this.offerModel
      .find(filter)
      .populate('targetIds')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActive() {
    const now = new Date();
    
    return this.offerModel
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate('targetIds')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Offer> {
    const offer = await this.offerModel
      .findById(id)
      .populate('targetIds')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  async update(id: string, updateOfferDto: Partial<CreateOfferDto>): Promise<Offer> {
    const offer = await this.offerModel
      .findByIdAndUpdate(id, updateOfferDto, { new: true, runValidators: true })
      .populate('targetIds')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  async remove(id: string): Promise<void> {
    const result = await this.offerModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
  }

  async activate(id: string): Promise<Offer> {
    const offer = await this.offerModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true, runValidators: true })
      .populate('targetIds')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  async deactivate(id: string): Promise<Offer> {
    const offer = await this.offerModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true, runValidators: true })
      .populate('targetIds')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  async findByTarget(targetId: string, appliesTo: string) {
    const now = new Date();
    
    return this.offerModel
      .find({
        isActive: true,
        appliesTo,
        targetIds: targetId,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .exec();
  }

  async findGroupOffers(groupSize: number) {
    const now = new Date();
    
    return this.offerModel
      .find({
        isActive: true,
        type: 'group_discount',
        startDate: { $lte: now },
        endDate: { $gte: now },
        $and: [
          {
            $or: [
              { minGroupSize: { $lte: groupSize } },
              { minGroupSize: { $exists: false } },
            ],
          },
          {
            $or: [
              { maxGroupSize: { $gte: groupSize } },
              { maxGroupSize: { $exists: false } },
            ],
          },
        ],
      })
      .exec();
  }

  async getStats() {
    const [total, active, expired, upcoming] = await Promise.all([
      this.offerModel.countDocuments(),
      this.offerModel.countDocuments({ 
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      }),
      this.offerModel.countDocuments({ 
        endDate: { $lt: new Date() },
      }),
      this.offerModel.countDocuments({ 
        startDate: { $gt: new Date() },
      }),
    ]);

    return {
      total,
      active,
      expired,
      upcoming,
    };
  }
}


