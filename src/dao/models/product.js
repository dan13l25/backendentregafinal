import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const { Schema } = mongoose;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price must be a positive number"]
    },
    stock: {
        type: Number,
        required: true,
        min: [0, "Stock must be a positive number"]
    },
    status: {
        type: Boolean,
        required: true
    },
    thumbnails: {
        type: [String],
        required: true
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cartsModel'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        default: "admin"
    }
});

productSchema.plugin(mongoosePaginate)
const Product = mongoose.model("Product", productSchema);

export default Product;
