import express from "express";
import productController from "../controllers/productController.js";
import { generateFakeProduct } from "../utils/fakeProduct.js";
import { errorTypes } from "../utils/errorTypes.js";
import { isAdmin, isPremium } from "../middlewares/adminAuth.js";
import { authenticate } from "../middlewares/authenticate.js";
import { auth } from "../middlewares/auth.js";
import { configureProductMulter  } from "../utils.js";

const productRouter = express.Router();
const image = configureProductMulter ()

// Middleware de autenticación
productRouter.get("/", productController.getProducts);

// Ruta para actualizar un producto y añadirle una imagen
productRouter.put("/updateProductImage/:pid", image.single('thumbnail'), productController.updateProductImage);

// Ruta para generar productos ficticios
productRouter.get("/mockingproducts", (req, res) => {
    try {
        const fakeProducts = generateFakeProduct();
        res.json(fakeProducts);
    } catch (error) {
        console.error("Error al generar productos ficticios:", error.message);
        res.status(errorTypes.ERROR_INTERNAL_ERROR).json({ error: "Error interno del servidor" });
    }
});

// Ruta para renderizar la página de productos
productRouter.get("/view", productController.renderProductsPage);

productRouter.get("/:pid", productController.getProductById);
productRouter.get("/brand/:brand", productController.getByBrand);
productRouter.post('/addProduct', authenticate, isAdmin,isPremium, image.array('thumbnails', 5), productController.addProduct);

productRouter.delete("/:pid", authenticate, productController.deleteProductById);

productRouter.put("/:pid", authenticate, productController.updateProduct);

export { productRouter };
