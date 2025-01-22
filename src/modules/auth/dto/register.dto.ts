import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { OmitType } from '@nestjs/mapped-types';

export class RegisterDto extends OmitType(CreateUserDto, ['role'] as const) {}
