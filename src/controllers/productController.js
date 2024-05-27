import productService from "../dao/services/productService.js";
import ProductDTO from "../dao/DTO/productDTO.js";
import { errorTypes } from "../utils/errorTypes.js";
import { succesTypes } from "../utils/errorTypes.js";
import { CustomError } from "../utils/customError.js"; 

export default class ProductController {
    constructor() {
        console.log("productcontroller funciona");
    }

    async addProduct(req, res, next) {
        const { title, description, price, thumbnails, code, stock, status, category, brand } = req.body;
    
        if (!title || !price) {
            return next(CustomError.createError({
                name: "ValidationError",
                message: "Title and Price are required fields",
                code: errorTypes.ERROR_BAD_REQUEST, 
                description: "Missing required fields: title and price"
            }));
        }
    
        const userId = req.userId;
        const productData = new ProductDTO(title, brand, description, price, stock, category, thumbnails, userId);
    
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
                productData.brand
            );
            res.status(succesTypes.SUCCESS_CREATED).json({ message: "Producto añadido correctamente" });
        } catch (error) {
            next(CustomError.createError({
                name: "AddProductError",
                message: "Error al añadir el producto",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async readProducts(req, res, next) {
        try {
            const products = await productService.readProducts();
            res.json(products);
        } catch (error) {
            next(CustomError.createError({
                name: "ReadProductsError",
                message: "Error al leer los productos",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async getProducts(req, res, next) {
        const { category, brand, sort } = req.query;

        try {
            const products = await productService.getProducts(category, brand, sort);
            res.json(products);
        } catch (error) {
            next(CustomError.createError({
                name: "GetProductsError",
                message: "Error al obtener los productos",
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
            next(CustomError.createError({
                name: "GetByBrandError",
                message: "Error al obtener los productos por marca",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async deleteProductById(req, res, next) {
        const { pid } = req.params;

        try {
            await productService.deleteProductById(pid);
            res.json({ message: "Producto eliminado correctamente" });
        } catch (error) {
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

        try {
            const updatedProduct = await productService.updateProduct(pid, newData);
            res.json(updatedProduct);
        } catch (error) {
            next(CustomError.createError({
                name: "UpdateProductError",
                message: "Error al actualizar el producto",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async renderProductsPage(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 4;
            const page = parseInt(req.query.page) || 1;

            const options = {
                limit,
                page,
                lean: true
            };

            const result = await productService.paginateProducts(options);
            const products = result.docs;  
            const totalPages = result.totalPages;
            const currentPage = result.page;

            res.render("product", { products, totalPages, currentPage });
        } catch (error) {
            next(CustomError.createError({
                name: "RenderProductsPageError",
                message: "Error al renderizar la página de productos paginados",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }
}
