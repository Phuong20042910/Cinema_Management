import mongoose from 'mongoose';

const promotionSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    validUntil: { type: Date, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
