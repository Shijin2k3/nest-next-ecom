import { Role } from '@prisma/client';

export class AuthResponseDto {
  accessToken!: string;
  refreshToken?: string;
  user!: {
    userId: string;
    emailId: string;
    firstName: string | null;
    lastName: string | null;
    role: Role;
  };
}
