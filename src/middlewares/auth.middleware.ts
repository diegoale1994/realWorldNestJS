import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { ExpressRequest } from "src/types/expressRequest.interface";
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from "src/config";
import { UserService } from "src/user/user.service";
import { UserEntity } from "src/user/user.entity";

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    constructor(private readonly userService: UserService) { }

    async use(req: ExpressRequest, _: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            req.user = null;
            next();
            return;
        }

        const token = req.headers.authorization.split(' ')[1];

        try {
            const decoded: UserEntity = verify(token, JWT_SECRET);
            const user = await this.userService.findById(decoded.id);
            req.user = user;
            next();
        } catch (err) {
            req.user = null;
            next();
        }
    }

}