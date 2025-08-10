import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsClient } from '../clients/products.client';
import { CartClient } from '../clients/cart.client';
import { PaymentRecordsClient } from '../clients/payment-records.client';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsClient: ProductsClient,
    private cartClient: CartClient,
    private paymentRecordsClient: PaymentRecordsClient,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto, auth?: string): Promise<Order> {
    // Get cart items and validate
    const cart = await this.cartClient.getUserCart(userId, auth);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock for all items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      try {
        const product = await this.productsClient.getProduct(cartItem.productId.toString(), auth);
        const variant = product.variants.find((v: any) => v._id?.toString() === cartItem.variantId.toString());
        
        if (!variant) {
          throw new BadRequestException(`Product variant not found for ${product.name}`);
        }

        if (!variant.isActive) {
          throw new BadRequestException(`Product variant is not active for ${product.name}`);
        }

        if (variant.stock < cartItem.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}`);
        }

        const itemTotal = variant.price * cartItem.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: cartItem.productId,
          variantId: cartItem.variantId,
          quantity: cartItem.quantity,
          price: variant.price,
          total: itemTotal,
        });

        // Reserve stock
        await this.productsClient.updateProductStock(
          cartItem.productId.toString(), 
          cartItem.quantity, 
          'decrement',
          auth
        );
      } catch (error) {
        throw new BadRequestException(`Failed to process item: ${error.message}`);
      }
    }

    const order = new this.orderModel({
      ...createOrderDto,
      userId,
      items: orderItems,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      paymentStatus: 'pending',
      status: 'placed',
    });

    const savedOrder = await order.save();

    // Clear cart after successful order creation
    try {
      await this.cartClient.clearCart(cart._id || cart.id, auth);
    } catch (error) {
      // Log error but don't fail the order creation
      console.warn('Failed to clear cart after order creation:', error);
    }

    return savedOrder;
  }

  async findAll(userId?: string) {
    const filter = userId ? { userId } : {};
    
    return this.orderModel
      .find(filter)
      .populate('userId', 'name email')
      .populate('items.productId', 'name')
      .populate('paymentRecords')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId?: string): Promise<Order> {
    const filter: any = { _id: id };
    if (userId) filter.userId = userId;

    const order = await this.orderModel
      .findOne(filter)
      .populate('userId', 'name email')
      .populate('items.productId', 'name variants')
      .populate('paymentRecords')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const validStatuses = ['placed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    const order = await this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('userId', 'name email')
      .populate('items.productId', 'name')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updatePaymentStatus(id: string, paymentStatus: string, paidAmount?: number): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.paymentStatus = paymentStatus;
    if (paidAmount !== undefined) {
      order.paidAmount = paidAmount;
      order.dueAmount = order.totalAmount - paidAmount;
    }

    return await order.save();
  }

  async addPaymentRecord(orderId: string, paymentRecordId: string): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        { $addToSet: { paymentRecords: paymentRecordId } },
        { new: true }
      )
      .populate('paymentRecords')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async removePaymentRecord(orderId: string, paymentRecordId: string): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        { $pull: { paymentRecords: paymentRecordId } },
        { new: true }
      )
      .populate('paymentRecords')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async calculatePaymentStatus(orderId: string, auth?: string): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Get payment records from payment service
    let totalPaid = 0;
    try {
      const paymentRecords = await this.paymentRecordsClient.getByOrderId(orderId, auth);
      totalPaid = paymentRecords
        .filter((payment: any) => payment.status === 'paid')
        .reduce((sum: number, payment: any) => sum + payment.amount, 0);
    } catch (error) {
      console.warn('Failed to get payment records:', error);
    }

    order.paidAmount = totalPaid;
    order.dueAmount = order.totalAmount - totalPaid;

    // Update payment status based on amounts
    if (totalPaid === 0) {
      order.paymentStatus = 'pending';
    } else if (totalPaid >= order.totalAmount) {
      order.paymentStatus = 'paid';
    } else {
      order.paymentStatus = 'partially_paid';
    }

    return await order.save();
  }

  async cancel(id: string, userId?: string): Promise<Order> {
    const filter: any = { _id: id };
    if (userId) filter.userId = userId;

    const order = await this.orderModel.findOne(filter).exec();
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new BadRequestException('Cannot cancel delivered or already cancelled orders');
    }

    if (order.status === 'shipped' || order.status === 'out_for_delivery') {
      throw new BadRequestException('Cannot cancel orders that are already shipped');
    }

    order.status = 'cancelled';
    return await order.save();
  }

  async getStats() {
    const [total, placed, shipped, delivered, cancelled] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: 'placed' }),
      this.orderModel.countDocuments({ status: 'shipped' }),
      this.orderModel.countDocuments({ status: 'delivered' }),
      this.orderModel.countDocuments({ status: 'cancelled' }),
    ]);

    const revenueStats = await this.orderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    return {
      total,
      placed,
      shipped,
      delivered,
      cancelled,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
    };
  }
}


