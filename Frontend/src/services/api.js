import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMovies = async () => {
  const response = await api.get('/movies');
  return response.data;
};

export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};

export const getCinemas = async () => {
  const response = await api.get('/cinemas');
  return response.data;
};

export const getShowtimesByMovie = async (movieId) => {
  const response = await api.get(`/showtimes/movie/${movieId}`);
  return response.data;
};

export const getShowtimeById = async (id) => {
  const response = await api.get(`/showtimes/${id}`);
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/bookings/my-tickets');
  return response.data;
};

export const getBookedSeats = async (showtimeId) => {
  const response = await api.get(`/bookings/showtime/${showtimeId}/seats`);
  return response.data;
};

export default api;
