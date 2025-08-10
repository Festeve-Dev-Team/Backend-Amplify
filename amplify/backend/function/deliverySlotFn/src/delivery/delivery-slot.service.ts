import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliverySlot, DeliverySlotDocument } from './schemas/delivery-slot.schema';
import { CreateDeliverySlotDto } from './dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from './dto/update-delivery-slot.dto';

@Injectable()
export class DeliverySlotService {
  constructor(
    @InjectModel(DeliverySlot.name) private slotModel: Model<DeliverySlotDocument>,
  ) {}

  async getAvailableSlots(productId: Types.ObjectId): Promise<DeliverySlot[]> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    // TODO: In microservices architecture, product validation should be done
    // via cross-service communication or handled at the API Gateway level

    const now = new Date();
    const baseFilter: any = {
      startTime: { $gte: now },
      isActive: true,
      $expr: { $lt: ['$currentOrders', '$maxOrders'] }
    };

    // TODO: In microservices architecture, hot item check should be done
    // via cross-service communication with the e-commerce service
    // For now, we'll return all available slots regardless of hot item status

    const slots = await this.slotModel
      .find(baseFilter)
      .sort({ startTime: 1 })
      .exec();

    return slots || [];
  }

  async getAllSlots(): Promise<DeliverySlot[]> {
    return this.slotModel.find({ isActive: true }).sort({ startTime: 1 }).exec();
  }

  async createSlot(createDeliverySlotDto: CreateDeliverySlotDto): Promise<DeliverySlot> {
    const slot = new this.slotModel(createDeliverySlotDto);
    return slot.save();
  }

  async updateSlot(id: string, updateDeliverySlotDto: UpdateDeliverySlotDto): Promise<DeliverySlot> {
    const slot = await this.slotModel
      .findByIdAndUpdate(id, updateDeliverySlotDto, { new: true, runValidators: true })
      .exec();

    if (!slot) {
      throw new NotFoundException(`Delivery slot with ID ${id} not found`);
    }

    return slot;
  }

  async deleteSlot(id: string): Promise<void> {
    const result = await this.slotModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Delivery slot with ID ${id} not found`);
    }
  }

  async reserveSlot(slotId: string): Promise<DeliverySlot> {
    const slot = await this.slotModel
      .findOneAndUpdate(
        { 
          _id: slotId, 
          isActive: true,
          $expr: { $lt: ['$currentOrders', '$maxOrders'] }
        },
        { $inc: { currentOrders: 1 } },
        { new: true }
      )
      .exec();

    if (!slot) {
      throw new BadRequestException('Slot not available or fully booked');
    }

    return slot;
  }

  async releaseSlot(slotId: string): Promise<DeliverySlot> {
    const slot = await this.slotModel
      .findOneAndUpdate(
        { _id: slotId, currentOrders: { $gt: 0 } },
        { $inc: { currentOrders: -1 } },
        { new: true }
      )
      .exec();

    if (!slot) {
      throw new NotFoundException('Slot not found or no orders to release');
    }

    return slot;
  }
}


