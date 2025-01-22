import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/types/user.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException({
        isSuccess: false,
        message: 'User not found',
        error: 'Unauthorized',
      });
    }

    const hasRole = requiredRoles.some(
      (role) => user.role?.toString() === role.toString(),
    );

    if (!hasRole) {
      throw new UnauthorizedException({
        isSuccess: false,
        message: 'You do not have permission to access this resource',
        error: 'Unauthorized',
      });
    }

    return true;
  }
}
