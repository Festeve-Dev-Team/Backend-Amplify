import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    try {
      const event = new this.eventModel(createEventDto);
      return await event.save();
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new BadRequestException('Event with this name already exists');
      }
      throw error;
    }
  }

  async findAll(query: EventQueryDto) {
    const {
      type,
      startDate,
      endDate,
      region,
      regions,
      purohitRequired,
      page = 1,
      limit = 10,
      search,
    } = query;

    const filter: any = {};

    if (type) filter.type = type;
    if (region) filter.region = { $regex: region, $options: 'i' };
    if (regions && regions.length > 0) filter.regions = { $in: regions };
    if (purohitRequired !== undefined) filter.purohitRequired = purohitRequired;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ritualNotes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.eventModel
        .find(filter)
        .populate('linkedProducts.productId')
        .populate('specialOffers.productId')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments(filter),
    ]);

    return {
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel
      .findById(id)
      .populate('linkedProducts.productId')
      .populate('specialOffers.productId')
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async findToday(region?: string, regions?: string[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filter: any = {
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    };

    if (region) {
      filter.region = { $regex: region, $options: 'i' };
    }
    if (regions && regions.length > 0) {
      filter.regions = { $in: regions };
    }

    const events = await this.eventModel
      .find(filter)
      .populate('linkedProducts.productId')
      .populate('specialOffers.productId')
      .sort({ date: 1 })
      .exec();

    // Also find recurring events that match today
    const dayOfWeek = today.getDay();
    const recurringFilter: any = {
      'recurring.isRecurring': true,
      $or: [
        { 'recurring.frequency': 'daily' },
        {
          'recurring.frequency': 'weekly',
          'recurring.daysOfWeek': dayOfWeek,
        },
      ],
    };

    if (region) {
      recurringFilter.region = { $regex: region, $options: 'i' };
    }
    if (regions && regions.length > 0) {
      recurringFilter.regions = { $in: regions };
    }

    const recurringEvents = await this.eventModel
      .find(recurringFilter)
      .populate('linkedProducts.productId')
      .populate('specialOffers.productId')
      .exec();

    return [...events, ...recurringEvents];
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true, runValidators: true })
      .populate('linkedProducts.productId')
      .populate('specialOffers.productId')
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async findByDateRange(startDate: Date, endDate: Date, region?: string, regions?: string[]) {
    const filter: any = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (region) {
      filter.region = { $regex: region, $options: 'i' };
    }
    if (regions && regions.length > 0) {
      filter.regions = { $in: regions };
    }

    return this.eventModel
      .find(filter)
      .populate('linkedProducts.productId')
      .populate('specialOffers.productId')
      .sort({ date: 1 })
      .exec();
  }

  async findRecurringEvents(frequency?: string) {
    const filter: any = { 'recurring.isRecurring': true };
    
    if (frequency) {
      filter['recurring.frequency'] = frequency;
    }

    return this.eventModel
      .find(filter)
      .populate('linkedProducts.productId')
      .populate('specialOffers.productId')
      .sort({ name: 1 })
      .exec();
  }
}


