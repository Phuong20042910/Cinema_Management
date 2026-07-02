import mongoose from 'mongoose';

const cinemaSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    rooms: [
      {
        name: String,
        capacity: Number,
      }
    ]
  },
  { timestamps: true }
);

const Cinema = mongoose.model('Cinema', cinemaSchema);
export default Cinema;
