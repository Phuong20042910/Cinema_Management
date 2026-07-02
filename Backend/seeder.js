import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Movie from './models/Movie.js';
import Cinema from './models/Cinema.js';
import Showtime from './models/Showtime.js';
import User from './models/User.js';

dotenv.config();

connectDB();

const users = [
  {
    name: 'Admin System',
    email: 'admin@gmail.com',
    password: 'password123', // Will be hashed in pre-save middleware
    role: 'admin'
  },
  {
    name: 'Staff Member',
    email: 'staff@gmail.com',
    password: 'password123',
    role: 'staff'
  },
  {
    name: 'Customer Demo',
    email: 'user@gmail.com',
    password: 'password123',
    role: 'user'
  }
];

const movies = [
  {
    title: 'Bí Ẩn Hành Tinh Chết',
    originalTitle: 'Dune: Part Two',
    duration: 166,
    releaseDate: new Date('2026-06-30'),
    genres: ['Sci-Fi', 'Adventure'],
    description: 'Một nhóm thám hiểm không gian phát hiện ra một hành tinh lạ...',
    posterUrl: '/assets/poster_1.png',
    trailerUrl: 'https://youtube.com',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya'],
    status: 'NOW_SHOWING'
  },
  {
    title: 'Đại Lộ Báo Thù',
    originalTitle: 'Mad Max: Fury Road',
    duration: 120,
    releaseDate: new Date('2026-07-01'),
    genres: ['Action', 'Thriller'],
    description: 'Bị ám ảnh bởi quá khứ hỗn loạn...',
    posterUrl: '/assets/poster_2.png',
    trailerUrl: 'https://youtube.com',
    director: 'George Miller',
    cast: ['Tom Hardy', 'Charlize Theron'],
    status: 'NOW_SHOWING'
  }
];

const cinemas = [
  {
    name: 'CINEMAX Landmark 81',
    address: 'Tầng B1, Vincom Center Landmark 81, Quận Bình Thạnh',
    city: 'Hồ Chí Minh',
    rooms: [{ name: 'Phòng 1', capacity: 100 }, { name: 'Phòng 2', capacity: 80 }]
  },
  {
    name: 'CINEMAX Gò Vấp',
    address: 'Vincom Plaza Gò Vấp, Quận Gò Vấp',
    city: 'Hồ Chí Minh',
    rooms: [{ name: 'Phòng 3', capacity: 120 }]
  }
];

const importData = async () => {
  try {
    await User.deleteMany();
    await Movie.deleteMany();
    await Cinema.deleteMany();
    await Showtime.deleteMany();

    const createdUsers = await Promise.all(users.map(u => User.create(u)));
    const createdMovies = await Movie.insertMany(movies);
    const createdCinemas = await Cinema.insertMany(cinemas);

    // Create some showtimes for the first movie at both cinemas
    const showtimes = [
      {
        movie: createdMovies[0]._id,
        cinema: createdCinemas[0]._id,
        room: 'Phòng 1',
        startTime: new Date('2026-06-30T18:30:00Z'),
        price: 80000
      },
      {
        movie: createdMovies[0]._id,
        cinema: createdCinemas[0]._id,
        room: 'Phòng 2',
        startTime: new Date('2026-06-30T20:30:00Z'),
        price: 90000
      },
      {
        movie: createdMovies[0]._id,
        cinema: createdCinemas[1]._id,
        room: 'Phòng 1',
        startTime: new Date('2026-06-30T19:00:00Z'),
        price: 85000
      }
    ];

    await Showtime.insertMany(showtimes);

    console.log('Dữ liệu phim, rạp và suất chiếu đã được nạp thành công!');
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error}`);
    process.exit(1);
  }
};

importData();
