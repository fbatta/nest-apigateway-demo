import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

type UserInfo = {
  fullName: string;
  emailAddress: string;
  userInfo: string | string[];
};

@Controller('user')
export class UserController {
  constructor() {}

  @Get('info')
  getInfo(@Req() request: Request): UserInfo {
    console.log(request.headers['X-Apigateway-Api-Userinfo']);
    return {
      fullName: 'Mario',
      emailAddress: 'mario@rossi.it',
      userInfo: request.headers['X-Forwarded-Authorization'],
    };
  }
}
