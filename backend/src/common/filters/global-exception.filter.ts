import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { MongoServerError } from 'mongodb';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter, GqlExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();
    
    // Log the error for debugging
    this.logger.error('Exception caught:', exception);

    // Handle MongoDB specific errors
    if (exception instanceof MongoServerError) {
      return this.handleMongoError(exception);
    }

    // Handle TypeError (null/undefined access)
    if (exception instanceof TypeError) {
      return this.handleTypeError(exception);
    }

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      return exception;
    }

    // Handle network/connection errors
    if (exception instanceof Error && exception.name === 'AggregateError') {
      return this.handleNetworkError(exception);
    }

    // Default error handling
    return new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private handleMongoError(error: MongoServerError) {
    if (error.message.includes('text.query" cannot be empty')) {
      this.logger.warn('Empty search query attempted');
      return new HttpException(
        'Search query cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.error('MongoDB error:', error.message);
    return new HttpException(
      'Database operation failed',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private handleTypeError(error: TypeError) {
    if (error.message.includes('Cannot read properties of null')) {
      this.logger.warn('Null pointer access:', error.message);
      return new HttpException(
        'Resource not found or invalid data access',
        HttpStatus.NOT_FOUND,
      );
    }

    if (error.message.includes('Cannot read properties of undefined')) {
      this.logger.warn('Undefined property access:', error.message);
      return new HttpException(
        'Invalid data structure or missing property',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.error('Type error:', error.message);
    return new HttpException(
      'Data processing error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private handleNetworkError(error: Error) {
    this.logger.error('Network/Connection error:', error.message);
    return new HttpException(
      'Service temporarily unavailable',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}