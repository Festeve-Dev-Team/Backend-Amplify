import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PaymentRecordsClient } from '../clients/payment-records.client';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private paymentRecordsClient: PaymentRecordsClient,
  ) {}

  async create(userId: string, createBookingDto: CreateBookingDto, auth?: string): Promise<Booking> {
    const { date, timeSlot, purohitId, isGroupBooking, groupSize } = createBookingDto;

    // Validate group booking requirements
    if (isGroupBooking && (!groupSize || groupSize < 2)) {
      throw new BadRequestException('Group bookings require group size of at least 2');
    }

    // Check for slot collision
    const existingBooking = await this.bookingModel.findOne({
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      timeSlot,
      purohitId,
      status: { $in: ['pending', 'confirmed'] },
    }).exec();

    if (existingBooking) {
      throw new ConflictException('Time slot already booked');
    }

    // Validate booking date is not in the past
    if (new Date(date) < new Date()) {
      throw new BadRequestException('Cannot book for past dates');
    }

    const booking = new this.bookingModel({
      ...createBookingDto,
      userId,
    });

    return await booking.save();
  }

  async findAll(userId?: string) {
    const filter = userId ? { userId } : {};
    
    return this.bookingModel
      .find(filter)
      .populate('userId', 'name email')
      .populate('purohitId', 'name phone location')
      .populate('eventId', 'name description')
      .populate('groupOfferId', 'title discountValue')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId?: string): Promise<Booking> {
    const filter: any = { _id: id };
    if (userId) filter.userId = userId;

    const booking = await this.bookingModel
      .findOne(filter)
      .populate('userId', 'name email')
      .populate('purohitId', 'name phone location')
      .populate('eventId', 'name description')
      .populate('groupOfferId', 'title discountValue')
      .populate('paymentRecords')
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId?: string): Promise<Booking> {
    const filter: any = { _id: id };
    if (userId) filter.userId = userId;

    const booking = await this.bookingModel
      .findOneAndUpdate(filter, updateBookingDto, { new: true, runValidators: true })
      .populate('userId', 'name email')
      .populate('purohitId', 'name phone location')
      .populate('eventId', 'name description')
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async cancel(id: string, userId?: string): Promise<Booking> {
    const filter: any = { _id: id };
    if (userId) filter.userId = userId;

    const booking = await this.bookingModel.findOne(filter).exec();
    
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }

    // Check if booking can be cancelled (e.g., at least 24 hours before)
    const twentyFourHoursFromNow = new Date();
    twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);
    
    if (new Date(booking.date) < twentyFourHoursFromNow) {
      throw new BadRequestException('Cannot cancel booking less than 24 hours before the event');
    }

    booking.status = 'cancelled';
    return await booking.save();
  }

  async confirm(id: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(id).exec();
    
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.status !== 'pending') {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    booking.status = 'confirmed';
    return await booking.save();
  }

  async updatePaymentStatus(id: string, paymentStatus: string, paidAmount?: number): Promise<Booking> {
    const booking = await this.bookingModel.findById(id).exec();
    
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    booking.paymentStatus = paymentStatus;
    if (paidAmount !== undefined) {
      booking.paidAmount = paidAmount;
      booking.dueAmount = booking.amount - paidAmount;
    }

    return await booking.save();
  }

  async addPaymentRecord(bookingId: string, paymentRecordId: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findByIdAndUpdate(
        bookingId,
        { $addToSet: { paymentRecords: paymentRecordId } },
        { new: true }
      )
      .populate('paymentRecords')
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  async removePaymentRecord(bookingId: string, paymentRecordId: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findByIdAndUpdate(
        bookingId,
        { $pull: { paymentRecords: paymentRecordId } },
        { new: true }
      )
      .populate('paymentRecords')
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  async calculatePaymentStatus(bookingId: string, auth?: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findById(bookingId)
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Get payment records from payment service
    let totalPaid = 0;
    try {
      const paymentRecords = await this.paymentRecordsClient.getByBookingId(bookingId, auth);
      totalPaid = paymentRecords
        .filter((payment: any) => payment.status === 'paid')
        .reduce((sum: number, payment: any) => sum + payment.amount, 0);
    } catch (error) {
      console.warn('Failed to get payment records:', error);
    }

    booking.paidAmount = totalPaid;
    booking.dueAmount = booking.amount - totalPaid;

    // Update payment status based on amounts
    if (totalPaid === 0) {
      booking.paymentStatus = 'pending';
    } else if (totalPaid >= booking.amount) {
      booking.paymentStatus = 'paid';
    } else {
      booking.paymentStatus = 'partially_paid';
    }

    return await booking.save();
  }

  async getBookingsByDateRange(startDate: Date, endDate: Date, purohitId?: string) {
    const filter: any = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      status: { $in: ['pending', 'confirmed'] },
    };

    if (purohitId) {
      filter.purohitId = purohitId;
    }

    return this.bookingModel
      .find(filter)
      .populate('userId', 'name')
      .populate('eventId', 'name')
      .sort({ date: 1, timeSlot: 1 })
      .exec();
  }

  async getStats() {
    const [total, pending, confirmed, cancelled] = await Promise.all([
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ status: 'pending' }),
      this.bookingModel.countDocuments({ status: 'confirmed' }),
      this.bookingModel.countDocuments({ status: 'cancelled' }),
    ]);

    const revenueStats = await this.bookingModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);

    return {
      total,
      pending,
      confirmed,
      cancelled,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
    };
  }
}


