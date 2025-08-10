import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Purohit, PurohitDocument } from './schemas/purohit.schema';
import { CreatePurohitDto } from './dto/create-purohit.dto';
import { UpdatePurohitDto } from './dto/update-purohit.dto';
import { AddRatingDto } from './dto/add-rating.dto';
import { PurohitQueryDto } from './dto/purohit-query.dto';

@Injectable()
export class PurohitsService {
  constructor(
    @InjectModel(Purohit.name) private purohitModel: Model<PurohitDocument>,
  ) {}

  async create(createPurohitDto: CreatePurohitDto): Promise<Purohit> {
    try {
      const purohit = new this.purohitModel(createPurohitDto);
      return await purohit.save();
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new BadRequestException('Purohit with this phone already exists');
      }
      throw error;
    }
  }

  async findAll(query: PurohitQueryDto) {
    const {
      city,
      state,
      pincode,
      skills,
      rituals,
      languages,
      chargesCommission,
      availableOn,
      isActive,
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const filter: any = {};

    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (state) filter['location.state'] = { $regex: state, $options: 'i' };
    if (pincode) filter['location.pincode'] = pincode;
    if (skills?.length) filter.skills = { $in: skills };
    if (rituals?.length) filter.rituals = { $in: rituals };
    if (languages?.length) filter.languages = { $in: languages };
    if (chargesCommission !== undefined) filter.chargesCommission = chargesCommission;
    if (isActive !== undefined) filter.isActive = isActive;

    if (availableOn) {
      const date = new Date(availableOn);
      filter['availability.date'] = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { rituals: { $regex: search, $options: 'i' } },
        { languages: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort: any = {};
    if (sortBy === 'rating') {
      // We'll handle this separately since it's a virtual field
    } else if (sortBy === 'experience') {
      sort.experienceYears = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const [purohits, total] = await Promise.all([
      this.purohitModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.purohitModel.countDocuments(filter),
    ]);

    // Sort by rating if requested (after fetching due to virtual field)
    if (sortBy === 'rating') {
      purohits.sort((a, b) => {
        const aRating = (a as any).averageRating || 0;
        const bRating = (b as any).averageRating || 0;
        return sortOrder === 'desc' ? bRating - aRating : aRating - bRating;
      });
    }

    return {
      data: purohits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Purohit> {
    const purohit = await this.purohitModel.findById(id).exec();

    if (!purohit) {
      throw new NotFoundException(`Purohit with ID ${id} not found`);
    }

    return purohit;
  }

  async update(id: string, updatePurohitDto: UpdatePurohitDto): Promise<Purohit> {
    const purohit = await this.purohitModel
      .findByIdAndUpdate(id, updatePurohitDto, { new: true, runValidators: true })
      .exec();

    if (!purohit) {
      throw new NotFoundException(`Purohit with ID ${id} not found`);
    }

    return purohit;
  }

  async remove(id: string): Promise<void> {
    const result = await this.purohitModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Purohit with ID ${id} not found`);
    }
  }

  async addRating(id: string, userId: string, addRatingDto: AddRatingDto): Promise<Purohit> {
    const purohit = await this.purohitModel.findById(id).exec();
    
    if (!purohit) {
      throw new NotFoundException(`Purohit with ID ${id} not found`);
    }

    // Check if user has already rated this purohit
    const existingRating = purohit.ratings.find(
      rating => rating.userId.toString() === userId
    );

    if (existingRating) {
      throw new BadRequestException('You have already rated this purohit');
    }

    purohit.ratings.push({
      userId: userId as any,
      rating: addRatingDto.rating,
      review: addRatingDto.review,
      date: new Date(),
    });

    return await purohit.save();
  }

  async updateAvailability(id: string, availability: any[]): Promise<Purohit> {
    const purohit = await this.purohitModel
      .findByIdAndUpdate(
        id,
        { availability },
        { new: true, runValidators: true }
      )
      .exec();

    if (!purohit) {
      throw new NotFoundException(`Purohit with ID ${id} not found`);
    }

    return purohit;
  }

  async findByLocation(pincode: string, date?: Date) {
    const filter: any = { 'location.pincode': pincode, isActive: true };

    if (date) {
      filter['availability.date'] = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    return this.purohitModel.find(filter).exec();
  }

  async activateDeactivate(id: string, isActive: boolean): Promise<Purohit> {
    const purohit = await this.purohitModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .exec();

    if (!purohit) {
      throw new NotFoundException(`Purohit with ID ${id} not found`);
    }

    return purohit;
  }

  async findByRituals(rituals: string[], pincode?: string) {
    const filter: any = { 
      rituals: { $in: rituals }, 
      isActive: true 
    };

    if (pincode) {
      filter['location.pincode'] = pincode;
    }

    return this.purohitModel.find(filter).exec();
  }

  async findByLanguages(languages: string[], pincode?: string) {
    const filter: any = { 
      languages: { $in: languages }, 
      isActive: true 
    };

    if (pincode) {
      filter['location.pincode'] = pincode;
    }

    return this.purohitModel.find(filter).exec();
  }

  async findByCommissionType(commissionType: 'percentage' | 'flat') {
    return this.purohitModel.find({
      chargesCommission: true,
      commissionType,
      isActive: true
    }).exec();
  }
}


