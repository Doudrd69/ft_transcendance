import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// si jamais j'utlise ca: faire comme dans le authguard
@Injectable()
export class GatewayMiddleware implements NestMiddleware {

	use(req: Request, res: Response, next: NextFunction) {
		console.log('Request: ', req);
		next();
	}
}
