import mongoose from "mongoose";

export  const connectMongoDB = async () => {
    try {
      await mongoose.connect(MONGO_URL);
      console.log("MongoDB conectado");
    } catch (error) {
      console.error("Error al conectar a MongoDB:", error);
      process.exit(1);
    }
  };

  export default { connectMongoDB };