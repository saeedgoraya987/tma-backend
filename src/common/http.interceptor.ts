import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, Observable, throwError, TimeoutError } from 'rxjs';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: AxiosError | BadRequestException) => {
        if (error instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }

        if (error instanceof BadRequestException) {
          const response = error.getResponse();
          const message =
            typeof response === 'object' &&
            response !== null &&
            'message' in response
              ? response['message']
              : 'Bad Request';
          this.logger.error('Request error: ' + JSON.stringify(message));
          return throwError(
            () => new BadRequestException({ message: message }),
          );
        }

        const errorMessage = error.response?.data
          ? error.response.data
          : error.message;

        this.logger.error('Request error: ' + JSON.stringify(errorMessage));

        return throwError(() => new HttpException(errorMessage, error.status));
      }),
    );
  }
}
