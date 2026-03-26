const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        discountType: { type: String, enum: ["percent", "fixed"], default: "percent" },
        discountValue: { type: Number, default: 0, min: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PromoCode", promoCodeSchema);
