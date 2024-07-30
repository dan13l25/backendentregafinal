import { Server } from "socket.io";
import express from "express";
import { productRouter } from "./routes/productRouter.js";
import { cartRouter } from "./routes/cartRouter.js";
import userRouter from "./routes/userRouter.js";
import { connectMongoDB } from "./config/dbConfig.js";
import productService from "./dao/services/productService.js";
import { middlewareConfig, configureSwagger } from "./config/middlewareConfig.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { addLogger } from "./utils/loggers-env.js";
import cartService from "./dao/services/cartService.js";
import cors from "cors"
import { PORT } from "./utils.js"

const app = express(); 
const port = PORT || 3000
const server = app.listen(port, () => console.log("Servidor operando en puerto", port));

app.use(cors());
 
//configuracion de swagger
configureSwagger(app);

connectMongoDB();

// Configuración de Winston
app.use(addLogger);

// Configuración de middlewares
middlewareConfig(app);


// Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/users", userRouter);

// Ruta de prueba de logger
app.get("/loggertest", (req, res) => {
  try {
    req.logger.fatal("Este es un mensaje fatal");
    req.logger.error("Este es un mensaje de error");
    req.logger.warn("Este es un mensaje de advertencia");
    req.logger.info("Este es un mensaje de información");
    req.logger.debug("Este es un mensaje de depuración");

    res.status(200).send("Logs probados correctamente");
  } catch (error) {
    req.logger.error("Error al probar los logs:", error);
    res.status(500).send("Error al probar los logs");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/chat", (req, res) => {
  res.render("chat");
});

app.get("/product", (req, res) => {
  res.render("product");
});

// Middleware de manejo de errores
app.use(errorHandler);

// Configuración de socket.io
const io = new Server(server);
const messages = [];

io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado:", socket.id);
  socket.emit("messageLogs", messages);

  socket.on("login", (data) => {
    socket.username = data.username;
    socket.profileImage = data.profileImage;
    socket.emit("messageLogs", messages);
  });

  socket.on("message", (data) => {
    try {
      const messageData = {
        user: socket.username,
        profileImage: socket.profileImage,
        message: data.message,
        time: data.time
      };
      messages.push(messageData); 
      io.emit("messageLogs", messages); 
    } catch (error) {
      console.error("Error al guardar el mensaje:", error);
    }
  });

  socket.on("producto", async () => {
    try {
      const allProduct = await productService.getProducts();
      console.log(allProduct);
      io.emit("producto", allProduct);
    } catch (error) {
      console.error("Error al mostrar productos:", error);
    }
  });

  socket.on("addToCart", async ({ productId }) => {
    try {
      console.log("Product ID received:", productId);
      const product = await productService.getProductById(productId);
      if (!product) {
        console.error("Producto no encontrado:", productId);
        socket.emit('cartUpdated', 'Producto no encontrado.');
        return;
      }

      const userId = socket.handshake.session.user ? socket.handshake.session.user._id : 'default-user-id'; 
      await cartService.addToCart(userId, productId);
      socket.emit('cartUpdated', 'Producto agregado al carrito con éxito.');
    } catch (error) {
      console.error("Error al agregar el producto al carrito:", error);
      socket.emit('cartUpdated', 'Error al agregar el producto al carrito.');
    }
  });
});

export { app, server, io };