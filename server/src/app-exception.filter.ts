import {ExceptionFilter, Catch, ArgumentsHost} from '@nestjs/common';

@Catch()
export class ErrorFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        console.log(`[ERROR] ${exception.stack}`)
        console.log(`[ERROR] ${exception.name}, ${exception.message}`)
    }
}