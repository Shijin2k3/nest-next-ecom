import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email Id is required' })
  @IsString()
  emailId!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password!: string;
}
