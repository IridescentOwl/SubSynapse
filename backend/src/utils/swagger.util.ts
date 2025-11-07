import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Subsynapse API',
    version: '1.0.0',
    description: 'API documentation for the Subsynapse subscription sharing platform.',
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? `${process.env.FRONTEND_URL}/api` 
        : 'http://localhost:4000/api',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      }
    },
  },
  security: [
    {
      bearerAuth: [],
    },
    {
      apiKey: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
