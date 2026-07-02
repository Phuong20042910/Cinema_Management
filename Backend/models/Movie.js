import mongoose from 'mongoose';

const movieSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    originalTitle: String,
    duration: {
      type: Number,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    genres: [String],
    description: String,
    posterUrl: String,
    trailerUrl: String,
    director: String,
    cast: [String],
    status: {
      type: String,
      enum: ['NOW_SHOWING', 'COMING_SOON', 'STOPPED'],
      default: 'NOW_SHOWING',
    }
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
