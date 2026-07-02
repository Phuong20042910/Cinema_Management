import mongoose from 'mongoose';

const showtimeSchema = mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
    room: { type: String, required: true },
    startTime: { type: Date, required: true },
    price: { type: Number, default: 80000 },
  },
  { timestamps: true }
);

const Showtime = mongoose.model('Showtime', showtimeSchema);
export default Showtime;
