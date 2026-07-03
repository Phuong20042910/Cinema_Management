import swaggerJsDoc from 'swagger-jsdoc';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 💡 ĐỔI THÀNH TRUE/FALSE TẠI ĐÂY
// true  -> Hiển thị link localhost:5000 trong trang Swagger (khi test ở máy)
// false -> Hiển thị link Railway trong trang Swagger (khi deploy)
const useLocalServer = false;

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
        url: useLocalServer 
          ? 'http://localhost:5000' 
          : 'https://cinemamanagement-production-f12a.up.railway.app',
        description: useLocalServer ? 'Development server' : 'Production server',
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
