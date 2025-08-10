import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminSettings, AdminSettingsDocument } from './schemas/admin-settings.schema';
import { UpdateAdminSettingsDto } from './dto/update-admin-settings.dto';

@Injectable()
export class AdminSettingsService {
  constructor(
    @InjectModel(AdminSettings.name) private adminSettingsModel: Model<AdminSettingsDocument>,
  ) {}

  async getSettings(): Promise<AdminSettingsDocument> {
    let settings = await this.adminSettingsModel
      .findOne()
      .populate('dailyEventId')
      .populate('featuredProductIds')
      .populate('featuredEventIds')
      .populate('manuallyCuratedTrending')
      .populate('homepageSections.productId')
      .populate('homepageSections.eventId')
      .populate('banners.productId')
      .populate('banners.eventId')
      .exec();

    if (!settings) {
      // Create default settings if none exist
      settings = new this.adminSettingsModel({});
      await settings.save();
      
      // Populate after saving
      const populatedSettings = await this.adminSettingsModel
        .findById(settings._id)
        .populate('dailyEventId')
        .populate('featuredProductIds')
        .populate('featuredEventIds')
        .populate('manuallyCuratedTrending')
        .exec();
      
      if (!populatedSettings) {
        throw new Error('Failed to create admin settings');
      }
      settings = populatedSettings;
    }

    return settings;
  }

  async updateSettings(updateAdminSettingsDto: UpdateAdminSettingsDto): Promise<AdminSettingsDocument> {
    let settings = await this.adminSettingsModel.findOne().exec();
    
    if (!settings) {
      settings = new this.adminSettingsModel(updateAdminSettingsDto);
    } else {
      Object.assign(settings, updateAdminSettingsDto);
    }

    await settings.save();
    
    const result = await this.adminSettingsModel
      .findById(settings._id)
      .populate('dailyEventId')
      .populate('featuredProductIds')
      .populate('featuredEventIds')
      .populate('manuallyCuratedTrending')
      .populate('homepageSections.productId')
      .populate('homepageSections.eventId')
      .populate('banners.productId')
      .populate('banners.eventId')
      .exec();
    
    if (!result) {
      throw new Error('Failed to retrieve updated settings');
    }
    
    return result;
  }

  async updateHomepageSection(key: string, sectionData: any): Promise<AdminSettingsDocument> {
    const settings = await this.getSettings();
    
    const sectionIndex = settings.homepageSections.findIndex(section => section.key === key);
    
    if (sectionIndex > -1) {
      Object.assign(settings.homepageSections[sectionIndex], sectionData);
    } else {
      settings.homepageSections.push({ key, ...sectionData });
    }

    await settings.save();
    return this.getSettings();
  }

  async addBanner(bannerData: any): Promise<AdminSettingsDocument> {
    const settings = await this.getSettings();
    settings.banners.push(bannerData);
    await settings.save();
    return this.getSettings();
  }

  async updateBanner(index: number, bannerData: any): Promise<AdminSettingsDocument> {
    const settings = await this.getSettings();
    
    if (index < 0 || index >= settings.banners.length) {
      throw new NotFoundException('Banner not found');
    }

    Object.assign(settings.banners[index], bannerData);
    await settings.save();
    return this.getSettings();
  }

  async removeBanner(index: number): Promise<AdminSettingsDocument> {
    const settings = await this.getSettings();
    
    if (index < 0 || index >= settings.banners.length) {
      throw new NotFoundException('Banner not found');
    }

    settings.banners.splice(index, 1);
    await settings.save();
    return this.getSettings();
  }

  async reorderBanners(newOrder: number[]): Promise<AdminSettingsDocument> {
    const settings = await this.getSettings();
    
    if (newOrder.length !== settings.banners.length) {
      throw new NotFoundException('Invalid banner order');
    }

    const reorderedBanners = newOrder.map(index => {
      if (index < 0 || index >= settings.banners.length) {
        throw new NotFoundException('Invalid banner index');
      }
      return settings.banners[index];
    });

    settings.banners = reorderedBanners;
    await settings.save();
    return this.getSettings();
  }

  async getActiveBanners() {
    const settings = await this.getSettings();
    return settings.banners
      .filter(banner => banner.isActive)
      .sort((a, b) => a.position - b.position);
  }

  async getEnabledHomepageSections() {
    const settings = await this.getSettings();
    return settings.homepageSections.filter(section => section.enabled);
  }
}


