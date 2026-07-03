import swaggerJsDoc from 'swagger-jsdoc';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Cinema Management API',
      version: '1.0.0',
      description: 'API Documentation cho hệ thống Rạp chiếu phim CINEMAX',
    },
    servers: [
      {
        url: 'https://cinemamanagement-production-f12a.up.railway.app', // Update the production URL here as well
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);
