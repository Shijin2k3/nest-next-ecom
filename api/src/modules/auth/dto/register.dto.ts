import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Email Id is required' })
  @IsString()
  emailId!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password!: string;

  @IsNotEmpty({ message: 'First Name is required' })
  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
