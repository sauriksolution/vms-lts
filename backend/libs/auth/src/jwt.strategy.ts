import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Inject } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject(ConfigService) private configService: ConfigService) {
        const jwtSecret = configService.get<string>("JWT_SECRET");
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: any) {
        return { permission: payload.permission, email: payload.email };
    }
}
