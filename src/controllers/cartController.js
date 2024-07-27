import cartService from "../dao/services/cartService.js";
import { errorTypes } from "../utils/errorTypes.js";
import { CustomError } from "../utils/customError.js";

export default class CartController {
    constructor() {
    }

    async getCartById(req, res, next) {
        const { cartId } = req.params;
        try {
            const cart = await cartService.getCartById(req, cartId);
            if (cart) {
                res.json(cart);
            } else {
                next(CustomError.createError({
                    name: "CartNotFoundError",
                    message: "Carrito no encontrado",
                    code: errorTypes.ERROR_NOT_FOUND,
                    description: `Cart with id ${cartId} not found`
                }));
            }
        } catch (error) {
            req.logger.error("Error al obtener el carrito:", error.message);
            next(CustomError.createError({
                name: "GetCartError",
                message: "Error al obtener el carrito",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async createCart(req, res, next) {
        try {
            const newCart = await cartService.createCart(req);
            res.status(201).json(newCart);
        } catch (error) {
            req.logger.error("Error al crear el carrito:", error.message);
            next(CustomError.createError({
                name: "CreateCartError",
                message: "Error al crear el carrito",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async addProduct(req, res, next) {
        const { cartId, productId } = req.params;
        try {
            await cartService.addProduct(req, cartId, productId);
            res.send("Producto añadido al carrito correctamente");
        } catch (error) {
            req.logger.error("Error al añadir producto al carrito:", error.message);
            next(CustomError.createError({
                name: "AddProductError",
                message: "Error al añadir producto al carrito",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async deleteProduct(req, res, next) {
        const { cartId, productId } = req.params;
        try {
            await cartService.deleteProduct(req, cartId, productId);
            res.send("Producto eliminado del carrito correctamente");
        } catch (error) {
            req.logger.error("Error al eliminar producto del carrito:", error.message);
            next(CustomError.createError({
                name: "DeleteProductError",
                message: "Error al eliminar producto del carrito",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async buyCart(req, res, next) {
        const { cartId } = req.params;
        const cartData = req.body;
        try {
            const ticket = await cartService.buyCart(req, cartId, cartData);
            res.json(ticket);
        } catch (error) {
            req.logger.error("Error al realizar la compra:", error.message);
            next(CustomError.createError({
                name: "BuyCartError",
                message: "Error al realizar la compra",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async getBuyCart(req, res, next) {
        const { cartId } = req.params;
        const userId = req.session.userId;
        const user = req.session.user;
        const isAuthenticated = req.session.isAuthenticated;
        const jwtToken = req.session.token;

        try {
            const cart = await cartService.getCartById(req, cartId, userId);
            const purchaseCartView = await cartService.getPurchaseCart(req);
            res.render(purchaseCartView, { user, isAuthenticated, jwtToken, cart });
        } catch (error) {
            req.logger.error("Error al obtener el carrito de compra:", error.message);
            next(CustomError.createError({
                name: "GetBuyCartError",
                message: "Error al obtener el carrito de compra",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async deleteProductFromCart(req, res, next) {
        const { cid, pid } = req.params;
        const userId = req.session.userId;

        try {
            const cart = await cartService.deleteProductFromCart(cid, userId, pid);
            return res.json({ message: "Producto eliminado del carrito correctamente", cart });
        } catch (error) {
            req.logger.error("Error al eliminar el producto del carrito:", error);
            next(CustomError.createError({
                name: "DeleteProductError",
                message: "Error al eliminar el producto del carrito",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async updateProductQuantityInCart(req, res, next) {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const userId = req.session.userId;

        try {
            const cart = await cartService.updateProductQuantityInCart(cid, userId, pid, quantity);
            return res.json({ message: "Cantidad del producto en el carrito actualizada correctamente", cart });
        } catch (error) {
            req.logger.error("Error al actualizar la cantidad del producto en el carrito:", error);
            next(CustomError.createError({
                name: "UpdateProductQuantityError",
                message: "Error al actualizar la cantidad del producto en el carrito",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async updateCart(req, res, next) {
        const { cid } = req.params;
        const { products } = req.body;
        const userId = req.session.userId;

        try {
            const cart = await cartService.updateCart(cid, userId, products);
            return res.json(cart);
        } catch (error) {
            req.logger.error("Error al actualizar el carrito:", error);
            next(CustomError.createError({
                name: "UpdateCartError",
                message: "Error al actualizar el carrito",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async clearCart(req, res, next) {
        const { cid } = req.params;
        const userId = req.session.userId;

        try {
            const cart = await cartService.clearCart(cid, userId);
            return res.json({ message: "Carrito vaciado completamente", cart });
        } catch (error) {
            req.logger.error("Error al vaciar el carrito:", error);
            next(CustomError.createError({
                name: "ClearCartError",
                message: "Error al vaciar el carrito",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }
}