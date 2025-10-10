import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root directory
config({ path: resolve(__dirname, '../../.env') });

// Debug: Log JWT_SECRET to verify it's loaded
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
console.log('JWT_SECRET value:', process.env.JWT_SECRET);

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { urlencoded, json } from 'express';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    
    // Register global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());
    
    // Register global validation pipe
    app.useGlobalPipes(new ValidationPipe());
    
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    await app.listen(process.env.PORT || 3001, '0.0.0.0');
}
bootstrap();
