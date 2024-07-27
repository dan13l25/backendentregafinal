import productService from "../dao/services/productService.js";
import ProductDTO from "../dao/DTO/productDTO.js";
import { errorTypes } from "../utils/errorTypes.js";
import { succesTypes } from "../utils/errorTypes.js";
import { CustomError } from "../utils/customError.js";
import { transporter } from "../config/mailer.js";

class ProductController {
    constructor() {
    }

    async getProducts(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 4;
            const page = parseInt(req.query.page) || 1;
            const options = { limit, page, lean: true };
            const products = await productService.paginateProducts(options);
            const totalPages = Math.ceil(products.total / limit);
            const isValid = page >= 1 && page <= totalPages;
            products.isValid = isValid;
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(errorTypes.ERROR_INTERNAL_ERROR).send("Error al recibir productos");
        }
    }

    async updateProductImage(req, res, next) {
        const { pid } = req.params;
        const thumbnail = req.file ? req.file.path : null;
        if (!thumbnail) {
            return res.status(400).json({ message: "Image file is required" });
        }
        req.body.thumbnail = thumbnail;
        try {
            const updatedProduct = await productService.updateProductImage(pid, thumbnail);
            res.json({ message: "Producto actualizado correctamente", product: updatedProduct });
        } catch (error) {
            next(error);
        }
    }

    async renderProductsPage(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 4;
            const page = parseInt(req.query.page) || 1;
            const options = { limit, page, lean: true };
    
            const result = await productService.paginateProducts(options);
            const products = result.docs;
            const totalPages = result.totalPages;
            const currentPage = result.page;
    
            res.render("product", { products, totalPages, currentPage, limit });
        } catch (error) {
            req.logger.error("Error al renderizar la página de productos paginados:", error.message);
            next(CustomError.createError({
                name: "RenderProductsPageError",
                message: "Error al renderizar la página de productos paginados",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async getProductById(req, res, next) {
        const { pid } = req.params;
        try {
            const product = await productService.getProductById(pid);
            if (!product) {
                return next(CustomError.createError({
                    name: "ProductNotFoundError",
                    message: "Producto no encontrado",
                    code: errorTypes.ERROR_NOT_FOUND,
                    description: `Product with id ${pid} not found`
                }));
            }
            res.json(product);
        } catch (error) {
            req.logger.error("Error al obtener el producto:", error.message);
            next(CustomError.createError({
                name: "GetProductByIdError",
                message: "Error al obtener el producto",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async getByBrand(req, res, next) {
        const { brand } = req.params;
        try {
            const products = await productService.getByBrand(brand);
            res.json(products);
        } catch (error) {
            req.logger.error("Error al obtener los productos por marca:", error.message);
            next(CustomError.createError({
                name: "GetByBrandError",
                message: "Error al obtener los productos por marca",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async addProduct(req, res, next) {
        const { title, description, price, code, stock, status, category, brand } = req.body;
        const thumbnails = req.body.thumbnails; 
        const userId = req.userId; 
        const userRole = req.session.user.role; 

        if (!title || !price) {
            return next(CustomError.createError({
                name: "ValidationError",
                message: "Title and Price are required fields",
                code: errorTypes.ERROR_BAD_REQUEST,
                description: "Missing required fields: title and price"
            }));
        }

        if (price < 0 || stock < 0) {
            return next(CustomError.createError({
                name: "ValidationError",
                message: "Price and Stock cannot be negative",
                code: errorTypes.ERROR_BAD_REQUEST,
                description: "Price and stock must be non-negative values"
            }));
        }


        let owner = "admin";
        if (userRole === "premium") {
            owner = req.session.user.email; 
        }

        const productData = new ProductDTO(title, brand, description, price, stock, category, thumbnails, owner);

        try {
            await productService.addProduct(
                productData.title,
                productData.description,
                productData.price,
                productData.image,
                code,
                productData.stock,
                status,
                productData.category,
                productData.brand,
                productData.owner
            );
            res.status(succesTypes.SUCCESS_CREATED).json({ message: "Producto añadido correctamente" });
        } catch (error) {
            req.logger.error("Error al añadir el producto:", error.message);
            next(CustomError.createError({
                name: "AddProductError",
                message: "Error al añadir el producto",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async deleteProductById(req, res, next) {
        const { pid } = req.params;
        const userRole = req.session.user.role; 
        const userEmail = req.session.user.email; 

        try {
            const product = await productService.getProductById(pid);

            if (!product) {
                return next(CustomError.createError({
                    name: "ProductNotFoundError",
                    message: "Producto no encontrado",
                    code: errorTypes.ERROR_NOT_FOUND,
                    description: `Product with id ${pid} not found`
                }));
            }

            if (userRole !== "admin" && product.owner !== userEmail) {
                return next(CustomError.createError({
                    name: "UnauthorizedError",
                    message: "No tienes permiso para eliminar este producto",
                    code: errorTypes.ERROR_UNAUTHORIZED,
                    description: `User with email ${userEmail} tried to delete product with id ${pid} owned by ${product.owner}`
                }));
            }

            await productService.deleteProductById(pid);

            if (userRole === "premium") {
                await transporter.sendMail({
                    from: '"Tu Empresa" <tuemail@dominio.com>',
                    to: userEmail,
                    subject: "Producto eliminado",
                    text: `Tu producto con ID: ${pid} ha sido eliminado.`,
                });
            }

            res.json({ message: "Producto eliminado correctamente" });
        } catch (error) {
            req.logger.error("Error al eliminar el producto:", error.message);
            next(CustomError.createError({
                name: "DeleteProductByIdError",
                message: "Error al eliminar el producto",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async updateProduct(req, res, next) {
        const { pid } = req.params;
        const newData = req.body;

        if (newData.price < 0 || newData.stock < 0) {
            return next(CustomError.createError({
                name: "ValidationError",
                message: "Price and Stock cannot be negative",
                code: errorTypes.ERROR_BAD_REQUEST,
                description: "Price and stock must be non-negative values"
            }));
        }

        try {
            const updatedProduct = await productService.updateProduct(pid, newData);
            res.json(updatedProduct);
        } catch (error) {
            req.logger.error("Error al actualizar el producto:", error.message);
            next(CustomError.createError({
                name: "UpdateProductError",
                message: "Error al actualizar el producto",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }
}

export default new ProductController();
