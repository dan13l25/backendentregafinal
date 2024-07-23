import cartRepositorie from "../repositories/cartRepositorie.js";
import productRepositorie from "../repositories/productRepositorie.js";
import { generateRandomCode } from "../../middlewares/auth.js";
import CartDTO from "../DTO/CartDTO.js";
import ticketRepositorie from "../repositories/ticketRepositorie.js";
import TicketDTO from "../DTO/TicketDTO.js";

const cartService = {
    async getCartById(req, cartId, userId) {
        return await cartRepositorie.getCartById(req, cartId, userId);
    },

    async createCart(req) {
        return await cartRepositorie.createCart(req);
    },

    async addProduct( cartId, productId) {
        const product = await productRepositorie.getProductById( productId);
        if (!product) {
            throw new Error(`Producto con ID ${productId} no encontrado`);
        }

        if (product.stock < 1) {
            throw new Error("Producto fuera de stock");
        }

        const updatedCart = await cartRepositorie.addProduct(req, cartId, productId);
        return updatedCart;
    },

    async deleteProduct(req, cartId, productId) {
        return await cartRepositorie.deleteProduct(req, cartId, productId);
    },

    async deleteProductFromCart(cid, userId, pid) {
        return await cartRepositorie.deleteProductFromCart(cid, userId, pid);
    },
    
    async updateProductQuantityInCart(cid, userId, pid, quantity) {
        return await cartRepositorie.updateProductQuantityInCart(cid, userId, pid, quantity);
    },

    async updateCart(cid, userId, products) {
        return await cartRepositorie.updateCart(cid, userId, products);
    },

    async clearCart(cid, userId) {
        return await cartRepositorie.clearCart(cid, userId);
    },

    async buyCart(req, cartId, cartData) {
        const { userId, quantity } = cartData;

        try {
            const cart = await this.getCartById(req, cartId, userId);

            let totalPurchaseAmount = 0;
            const productsToPurchase = [];
            const productsToKeepInCart = [];

            for (const item of cart.products) {
                const product = await productRepositorie.getProductById(req, item.product);

                if (!product) {
                    throw new Error(`Producto con ID ${item.product} no encontrado`);
                }

                if (product.stock >= item.productQuantity) {
                    product.stock -= item.productQuantity;
                    await product.save();

                    totalPurchaseAmount += item.productTotal;
                    productsToPurchase.push(item);
                } else {
                    productsToKeepInCart.push(item);
                }
            }

            if (productsToPurchase.length === 0) {
                throw new Error("No hay productos suficientes en stock para realizar la compra");
            }

            const cartDTO = new CartDTO(productsToPurchase, quantity, userId);

            const ticketDTO = new TicketDTO({
                code: generateRandomCode(10),
                purchase_datetime: new Date(),
                amount: totalPurchaseAmount,
                purchaser: userId,
                products: productsToPurchase.map(item => ({
                    product: item.product,
                    productQuantity: item.productQuantity,
                    productTotal: item.productTotal,
                })),
            });

            const ticket = await ticketRepositorie.createTicket(req, ticketDTO);

            cart.products = productsToKeepInCart;
            await cart.save();

            return ticket;
        } catch (error) {
            req.logger.error("Error al realizar la compra:", error.message);
            throw new Error("Error al realizar la compra: " + error.message);
        }
    },

    async getPurchaseCart(req) {
        return "purchase";
    }
};

export default cartService;