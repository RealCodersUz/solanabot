const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    userId: {
      type: mongoose.SchemaTypes.Number,
      required: true,
      unique: true,
    },
    publicKey: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    secretKey: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },

    is_deleted: {
      type: mongoose.SchemaTypes.Boolean,
      default: false,
    },
  },
  {
    // _id: false,
    // id: true,
    versionKey: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
