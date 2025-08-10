import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const slug = this.generateSlug(createCategoryDto.name);
    
    try {
      const category = new this.categoryModel({
        ...createCategoryDto,
        slug,
      });
      
      return await category.save();
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new ConflictException('Category slug already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find()
      .populate('parent', 'name slug')
      .sort({ name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<CategoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryModel
      .findById(id)
      .populate('parent', 'name slug')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    let updateData = { ...updateCategoryDto };

    // Regenerate slug if name changed
    if (updateCategoryDto.name) {
      (updateData as any).slug = this.generateSlug(updateCategoryDto.name);
    }

    try {
      const category = await this.categoryModel
        .findByIdAndUpdate(
          id,
          { ...updateData, updatedAt: new Date() },
          { new: true, runValidators: true }
        )
        .populate('parent', 'name slug')
        .exec();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return category;
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new ConflictException('Category slug already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Category not found');
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}


