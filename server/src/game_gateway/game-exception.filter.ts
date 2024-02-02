import { Catch, ArgumentsHost } from '@nestjs/common';
import {BaseWsExceptionFilter, WsException} from '@nestjs/websockets';

@Catch(WsException)
export class AllExceptionsFilter extends BaseWsExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost) {
        console.log(`[ERROR] ${exception.name}, ${exception.message}`)
        super.catch(exception, host);
    }
}
