import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsClient } from '../clients/products.client';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productsClient: ProductsClient,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartModel
      .findOne({ userId })
      .populate({
        path: 'items.productId',
        select: 'name variants',
      })
      .exec();

    if (!cart) {
      cart = new this.cartModel({ userId, items: [] });
      await cart.save();
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, variantId, quantity } = addToCartDto;

    // Validate product and variant exist
    try {
      const product = await this.productsClient.getProduct(productId);
      const variant = product.variants.find((v: any) => v._id?.toString() === variantId);
      
      if (!variant) {
        throw new BadRequestException('Product variant not found');
      }

      if (!variant.isActive) {
        throw new BadRequestException('Product variant is not active');
      }

      if (variant.stock < quantity) {
        throw new BadRequestException('Insufficient stock');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Product not found or unavailable');
    }

    let cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      cart = new this.cartModel({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => 
        item.productId.toString() === productId && 
        item.variantId.toString() === variantId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > 50) {
        throw new BadRequestException('Maximum quantity per item is 50');
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId: productId as any,
        variantId: variantId as any,
        quantity,
      });
    }

    await cart.save();
    return this.getCart(userId);
  }

  async updateCartItem(userId: string, productId: string, variantId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => 
        item.productId.toString() === productId && 
        item.variantId.toString() === variantId
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    // Validate stock availability
    try {
      const product = await this.productsClient.getProduct(productId);
      const variant = product.variants.find((v: any) => v._id?.toString() === variantId);
      
      if (!variant || variant.stock < updateCartItemDto.quantity) {
        throw new BadRequestException('Insufficient stock');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Continue with update if product service is unavailable
    }

    cart.items[itemIndex].quantity = updateCartItemDto.quantity;
    await cart.save();
    
    return this.getCart(userId);
  }

  async removeFromCart(userId: string, productId: string, variantId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter(
      item => 
        !(item.productId.toString() === productId && 
          item.variantId.toString() === variantId)
    );

    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<Cart> {
    let cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      cart = new this.cartModel({ userId, items: [] });
    } else {
      cart.items = [];
    }

    await cart.save();
    return cart;
  }

  async getCartItemCount(userId: string): Promise<number> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) return 0;
    
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }
}


