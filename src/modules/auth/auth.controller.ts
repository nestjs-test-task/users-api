import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '@modules/auth/services/auth.service';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '@modules/auth/guards/jwt-refresh.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiLoginSwagger } from '@modules/auth/swagger/login.swagger';
import { ApiRefreshSwagger } from '@modules/auth/swagger/refresh.swagger';
import { ApiLogoutSwagger } from '@modules/auth/swagger/logout.swagger';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  @Inject()
  private readonly authService: AuthService;

  @Post('login')
  @ApiLoginSwagger()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiRefreshSwagger()
  refresh(@CurrentUser() user: JwtPayload) {
    const { sub, token = '' } = user;
    return this.authService.refresh(sub, token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiLogoutSwagger()
  logout(@CurrentUser() user: JwtPayload) {
    console.log(user);
    return this.authService.logout(user.sub);
  }
}
