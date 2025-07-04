import { Role } from "../../constants";

export interface IRegisterUser {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export interface ILoginUser {
  email: string;
  password: string;
  role: Role;
}

export interface IGoogleUserData {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

export interface ITokenData {
  email: string;
  fullName: string;
  role: Role;
  id: string;
}

export interface IResetPassword {
  token: string;
  newPassword: string;
}
