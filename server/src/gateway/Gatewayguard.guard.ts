import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';

@Injectable()
export class  GatewayGuard implements CanActivate {

	constructor(private readonly jwtService: JwtService) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {

		const client = context.switchToWs().getClient();
		const token = client.handshake.auth.token;

		if (!token) {
			throw new UnauthorizedException();
		}

		try {
			const payload = await this.jwtService.verifyAsync(token, { secret: jwtConstants.secret } );
			client.handshake.auth = payload;
		} catch (error) {
			throw new UnauthorizedException();
		}
		
		console.log("Client verified: ", client.handshake.auth)
		return true;
	}
}
