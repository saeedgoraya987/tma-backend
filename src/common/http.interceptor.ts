import {
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
      catchError((error: AxiosError) => {
        if (error instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
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
