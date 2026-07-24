import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email Id is required' })
  @IsString()
  emailId!: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password!: string;
}
