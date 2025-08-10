import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from './schemas/newsletter.schema';
import { SubscribeDto } from './dto/subscribe.dto';
import { ConfirmDto } from './dto/confirm.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name) private newsletterModel: Model<NewsletterDocument>,
  ) {}

  async subscribe(subscribeDto: SubscribeDto): Promise<{ message: string }> {
    const { email } = subscribeDto;

    // Check if already subscribed
    const existing = await this.newsletterModel.findOne({ email }).exec();
    if (existing && existing.confirmed) {
      throw new BadRequestException('Email already subscribed');
    }

    // Generate confirmation token
    const token = randomBytes(32).toString('hex');

    if (existing) {
      // Update existing unconfirmed subscription
      existing.token = token;
      existing.confirmed = false;
      existing.unsubscribedAt = undefined;
      await existing.save();
    } else {
      // Create new subscription
      const newsletter = new this.newsletterModel({
        email,
        token,
        confirmed: false,
      });
      await newsletter.save();
    }

    // TODO: Send confirmation email with token
    return { message: 'Confirmation email sent' };
  }

  async confirm(confirmDto: ConfirmDto): Promise<{ message: string }> {
    const { token } = confirmDto;

    const subscription = await this.newsletterModel.findOne({ token }).exec();
    if (!subscription) {
      throw new NotFoundException('Invalid confirmation token');
    }

    if (subscription.confirmed) {
      return { message: 'Email already confirmed' };
    }

    subscription.confirmed = true;
    await subscription.save();

    return { message: 'Email confirmed successfully' };
  }

  async unsubscribe(token: string): Promise<{ message: string }> {
    const subscription = await this.newsletterModel.findOne({ token }).exec();
    if (!subscription) {
      throw new NotFoundException('Invalid unsubscribe token');
    }

    subscription.unsubscribedAt = new Date();
    await subscription.save();

    return { message: 'Successfully unsubscribed' };
  }

  async getSubscribers(confirmed: boolean = true) {
    const filter: any = { confirmed };
    if (confirmed) {
      filter.unsubscribedAt = { $exists: false };
    }

    return this.newsletterModel.find(filter).select('email createdAt').exec();
  }

  async getStats() {
    const [total, confirmed, unsubscribed] = await Promise.all([
      this.newsletterModel.countDocuments(),
      this.newsletterModel.countDocuments({ 
        confirmed: true, 
        unsubscribedAt: { $exists: false } 
      }),
      this.newsletterModel.countDocuments({ 
        unsubscribedAt: { $exists: true } 
      }),
    ]);

    return {
      total,
      confirmed,
      unsubscribed,
      pending: total - confirmed - unsubscribed,
    };
  }
}


