import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Testimonial, TestimonialDocument } from './schemas/testimonial.schema';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialQueryDto } from './dto/testimonial-query.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name) private testimonialModel: Model<TestimonialDocument>,
  ) {}

  async create(userId: string, createTestimonialDto: CreateTestimonialDto): Promise<Testimonial> {
    // Check if user already has a testimonial
    const existing = await this.testimonialModel.findOne({ userId }).exec();
    if (existing) {
      throw new BadRequestException('User already has a testimonial');
    }

    const testimonial = new this.testimonialModel({
      ...createTestimonialDto,
      userId,
    });

    return await testimonial.save();
  }

  async findAll(query: TestimonialQueryDto) {
    const {
      isVerified,
      approvedByAdmin,
      minRating,
      page = 1,
      limit = 10,
    } = query;

    const filter: any = {};

    if (isVerified !== undefined) filter.isVerified = isVerified;
    if (approvedByAdmin !== undefined) filter.approvedByAdmin = approvedByAdmin;
    if (minRating) filter.rating = { $gte: minRating };

    const skip = (page - 1) * limit;

    const [testimonials, total] = await Promise.all([
      this.testimonialModel
        .find(filter)
        .populate('userId', 'name')
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.testimonialModel.countDocuments(filter),
    ]);

    return {
      data: testimonials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findPublic() {
    return this.testimonialModel
      .find({ approvedByAdmin: true })
      .populate('userId', 'name')
      .sort({ rating: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialModel
      .findById(id)
      .populate('userId', 'name email')
      .exec();

    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    return testimonial;
  }

  async update(id: string, userId: string, updateTestimonialDto: UpdateTestimonialDto): Promise<Testimonial> {
    const testimonial = await this.testimonialModel.findById(id).exec();
    
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    if (testimonial.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own testimonials');
    }

    if (testimonial.approvedByAdmin) {
      throw new BadRequestException('Cannot update approved testimonials');
    }

    Object.assign(testimonial, updateTestimonialDto);
    return await testimonial.save();
  }

  async remove(id: string, userId?: string): Promise<void> {
    const testimonial = await this.testimonialModel.findById(id).exec();
    
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    // If userId provided, check ownership
    if (userId && testimonial.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own testimonials');
    }

    const result = await this.testimonialModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
  }

  async approve(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialModel
      .findByIdAndUpdate(
        id,
        { approvedByAdmin: true },
        { new: true, runValidators: true }
      )
      .exec();

    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    return testimonial;
  }

  async reject(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialModel
      .findByIdAndUpdate(
        id,
        { approvedByAdmin: false },
        { new: true, runValidators: true }
      )
      .exec();

    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    return testimonial;
  }

  async verify(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialModel
      .findByIdAndUpdate(
        id,
        { isVerified: true },
        { new: true, runValidators: true }
      )
      .exec();

    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    return testimonial;
  }

  async getStats() {
    const [total, approved, verified, averageRating] = await Promise.all([
      this.testimonialModel.countDocuments(),
      this.testimonialModel.countDocuments({ approvedByAdmin: true }),
      this.testimonialModel.countDocuments({ isVerified: true }),
      this.testimonialModel.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
    ]);

    return {
      total,
      approved,
      verified,
      pending: total - approved,
      averageRating: averageRating[0]?.avgRating || 0,
    };
  }
}


