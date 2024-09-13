import SignUpDto from './signup.dto';

export default class AdminSignUpDto extends SignUpDto {
  email: string;
  password: string;
  name: string;
  username: string;
}
