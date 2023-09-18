// import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get()
//   getHello(): string {
//     return this.appService.getHello();
//   }
// }

import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { get } from 'http';
import * as path from 'path';
import { AuthGuard } from './auth/auth.guard';

@Controller()
export class AppController {
	constructor() {}

	@Get()
	getIndex(@Res() res: Response): void {
		const indexFilePath = path.join(process.cwd(), 'client', 'index.html');
		res.sendFile(indexFilePath);
	}
}
