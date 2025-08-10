import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentRecord, PaymentRecordDocument } from './schemas/payment-record.schema';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';

@Injectable()
export class PaymentRecordsService {
  constructor(
    @InjectModel(PaymentRecord.name) private paymentRecordModel: Model<PaymentRecordDocument>,
  ) {}

  async create(userId: string, createPaymentRecordDto: CreatePaymentRecordDto): Promise<PaymentRecord> {
    const paymentRecord = new this.paymentRecordModel({
      ...createPaymentRecordDto,
      userId,
    });

    const savedPaymentRecord = await paymentRecord.save();
    return savedPaymentRecord;
  }

  async findAll(userId?: string) {
    const filter = userId ? { userId } : {};
    
    return this.paymentRecordModel
      .find(filter)
      .populate('userId', 'name email')
      .populate('referenceId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<PaymentRecord> {
    const paymentRecord = await this.paymentRecordModel
      .findById(id)
      .populate('userId', 'name email')
      .populate('referenceId')
      .exec();

    if (!paymentRecord) {
      throw new NotFoundException(`Payment record with ID ${id} not found`);
    }

    return paymentRecord;
  }

  async findByReference(relatedTo: string, referenceId: string) {
    return this.paymentRecordModel
      .find({ relatedTo, referenceId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(id: string, status: string, paidAt?: Date): Promise<PaymentRecord> {
    const updateData: any = { status };
    if (status === 'paid' && !paidAt) {
      updateData.paidAt = new Date();
    } else if (paidAt) {
      updateData.paidAt = paidAt;
    }

    const paymentRecord = await this.paymentRecordModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'name email')
      .exec();

    if (!paymentRecord) {
      throw new NotFoundException(`Payment record with ID ${id} not found`);
    }

    return paymentRecord;
  }

  async findByTransactionId(transactionId: string): Promise<PaymentRecord | null> {
    return this.paymentRecordModel
      .findOne({ transactionId })
      .populate('userId', 'name email')
      .populate('referenceId')
      .exec();
  }

  async getStats() {
    const [total, pending, paid, failed, refunded] = await Promise.all([
      this.paymentRecordModel.countDocuments(),
      this.paymentRecordModel.countDocuments({ status: 'pending' }),
      this.paymentRecordModel.countDocuments({ status: 'paid' }),
      this.paymentRecordModel.countDocuments({ status: 'failed' }),
      this.paymentRecordModel.countDocuments({ status: 'refunded' }),
    ]);

    const totalAmount = await this.paymentRecordModel.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      total,
      pending,
      paid,
      failed,
      refunded,
      totalAmount: totalAmount[0]?.total || 0,
    };
  }
}


