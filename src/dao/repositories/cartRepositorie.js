import cartsModel from "../models/cart.js";
import Product from "../models/product.js";

const cartRepositorie = {
    async getCartById(req, cartId) {
        try {
            return await cartsModel.findById(cartId).lean();
        } catch (error) {
            req.logger.error("Error al obtener el carrito:", error.message);
            throw error;
        }
    },

    async createCart(req) {
        try {
            const newCart = new cartsModel({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            req.logger.error("Error al crear el carrito:", error.message);
            throw error;
        }
    },

    async addProduct(req, cartId, productId) {
        try {
            let cart = await cartsModel.findById(cartId);
            if (!cart) {
                throw new Error("El carrito no existe.");
            }

            const product = await Product.findById(productId);
            if (!product) {
                throw new Error("El producto no existe.");
            }

            const existingProduct = cart.products.find(item => String(item.product) === String(productId));
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }

            await cart.save();
        } catch (error) {
            req.logger.error("Error al añadir producto al carrito:", error.message);
            throw error;
        }
    },

    async deleteProduct(req, cartId, productId) {
        try {
            let cart = await cartsModel.findById(cartId);
            if (!cart) {
                throw new Error("El carrito no existe.");
            }

            const index = cart.products.findIndex(item => String(item.product) === String(productId));
            if (index !== -1) {
                cart.products.splice(index, 1);
                await cart.save();
            } else {
                throw new Error("El producto no está en el carrito.");
            }
        } catch (error) {
            req.logger.error("Error al eliminar producto del carrito:", error.message);
            throw error;
        }
    },

    deleteProductFromCart: async (cartId, userId, productId) => {
        try {
          const cart = await cartsModel.findOneAndUpdate(
            { _id: cartId, user: userId },
            { $pull: { products: { product: productId } } },
            { new: true }
          );
          return cart;
        } catch (error) {
          throw new Error("Error al eliminar el producto del carrito: " + error.message);
        }
      },
    
      updateProductQuantityInCart: async (cartId, userId, productId, quantity) => {
        try {
          const cart = await cartsModel.findOneAndUpdate(
            { _id: cartId, user: userId, "products.product": productId },
            { $set: { "products.$.quantity": quantity } },
            { new: true }
          );
          return cart;
        } catch (error) {
          throw new Error("Error al actualizar la cantidad del producto en el carrito: " + error.message);
        }
      },
    
      updateCart: async (cartId, userId, products) => {
        try {
          const cart = await cartsModel.findOneAndUpdate(
            { _id: cartId, user: userId },
            { products: products },
            { new: true }
          );
          return cart;
        } catch (error) {
          throw new Error("Error al actualizar el carrito: " + error.message);
        }
      },
    
      clearCart: async (cartId, userId) => {
        try {
          const cart = await cartsModel.findOneAndUpdate(
            { _id: cartId, user: userId },
            { products: [], total: 0 },
            { new: true }
          );
          return cart;
        } catch (error) {
          throw new Error("Error al vaciar el carrito: " + error.message);
        }
      },

      findByUserId: async (userId) => {
        try {
            const cart = await Cart.findOne({ user: userId });

            return cart;
        }
        catch (error) {
            throw new Error("Error al obtener el carrito por ID: " + error.message);
        }
    },

};

export default cartRepositorie;