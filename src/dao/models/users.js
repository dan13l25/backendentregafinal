/*import mongoose from "mongoose";

const {Schema} = mongoose

const userSchema = new Schema({
    first_name: String,
    last_name: String,
    age: Number,
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    cart:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cartsModel"
    },
    role: { type: String, enum: ["user", "admin", "premium"], default: "user" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    documents: [
      {
          name: { type: String },
          reference: { type: String }
      }
  ],
  last_connection: Date,
});

const userModel = mongoose.model("user", userSchema)

export default userModel*/

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    age: Number,
    password: String,
    profile: String,
    cart:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cartsModel"
    },
    role: { type: String, enum: ["user", "admin", "premium"], default: "user" },
    resetToken: String,
    resetTokenExpires: Date,
    documents: [
        {
            name: { type: String},
            reference: { type: String}
        }
    ],
    last_connection: Date,
});

userSchema.plugin(mongoosePaginate);
const userModel = mongoose.model("User", userSchema);

export default userModel;