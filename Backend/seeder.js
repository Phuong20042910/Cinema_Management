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

const movies = [];

const cinemas = [
  {
    name: 'CINEMAX Landmark 81',
    address: 'Tầng B1, Vincom Center Landmark 81, Quận Bình Thạnh',
    city: 'Hồ Chí Minh',
    lat: 10.7981,
    lng: 106.7219,
    rooms: [{ name: 'Phòng 1', capacity: 100 }, { name: 'Phòng 2', capacity: 80 }]
  },
  {
    name: 'CINEMAX Gò Vấp',
    address: 'Vincom Plaza Gò Vấp, Quận Gò Vấp',
    city: 'Hồ Chí Minh',
    lat: 10.8291,
    lng: 106.6806,
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

    console.log('Dữ liệu phim, rạp và suất chiếu đã được nạp thành công!');
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error}`);
    process.exit(1);
  }
};

importData();
