import { UserService } from "../../../src/services/UserService";
import { IUserRepository } from "../../../src/repositories/interfaces/IUserRepository";
import { IEmailService } from "../../../src/services/EmailService/IEmailService";
import { TokenService } from "../../../src/services/TokenService";
import { describe, test, expect, beforeEach, jest } from "@jest/globals";;
import { NewUserDto } from "../../../src/dtos/NewUserDto";
import { ITokenBlacklistRepository } from "../../../src/repositories/interfaces/ITokenBlacklistRepository";

describe("UserService", () => {
  const LAST_NAME = "Doe";
  const FIRST_NAME = "John";
  const USER_NAME = "john.doe";
  const EMAIL = "john.doe@example.com";
  const PASSWORD = "StrongPassword123!";
  const SECRET_KEY = "fake-secret-key";
  const USER_ROLE = "user";
  const TOKEN = "eyJhbGci.ioiOjMDB9._XvU4pQHnIg";

  let userService: UserService;
  let userRepository: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let tokenBlacklistRepository: jest.Mocked<ITokenBlacklistRepository>
  let tokenService: TokenService;

  beforeEach(() => {
    userRepository = {
      FindUserByEmail: jest.fn(),
      FindUserByUserName: jest.fn(),
      SaveUser: jest.fn()
    };

    emailService = {
      SendUserRegistrationMail: jest.fn(),
    };

    tokenBlacklistRepository = {
      SaveToken: jest.fn(),
      IsBlacklisted: jest.fn(),
      RemoveExpired: jest.fn()
    }

    tokenService = new TokenService(SECRET_KEY, {}, tokenBlacklistRepository);
    jest.spyOn(tokenService, "GenerateToken").mockReturnValue("");
    jest.spyOn(tokenService, "VerifyToken").mockReturnValue("");
    jest.spyOn(tokenService, "SaveToken").mockResolvedValue();
    jest.spyOn(tokenService, "IsBlacklisted").mockResolvedValue(false);

    userService = new UserService(userRepository, emailService, tokenService);
  });

  describe("RegisterNewUser", () => {
    test("Given new user info When registering this user Then retrieve user by email", async () => {
      let newUserDto: NewUserDto = {
        lastName: LAST_NAME,
        firstName: FIRST_NAME,
        userName: USER_NAME,
        email: EMAIL,
        password: PASSWORD
      };
      
      await userService.RegisterNewUser(newUserDto);

      expect(userRepository.FindUserByEmail).toHaveBeenCalledWith(EMAIL);
    });

    test("Given existing email When registering new user Then throw existing email exception", async () => {
      userRepository.FindUserByEmail.mockResolvedValue({ email: EMAIL });
      let newUserDto: NewUserDto = {
        lastName: LAST_NAME,
        firstName: FIRST_NAME,
        userName: USER_NAME,
        email: EMAIL,
        password: PASSWORD
      };
      
      const promise = userService.RegisterNewUser(newUserDto);

      await expect(promise).rejects.toThrow("A user with this email already exists.")
    });

    test("Given new user info When registering this user Then retrieve user by username", async () => {
      let newUserDto: NewUserDto = {
        lastName: LAST_NAME,
        firstName: FIRST_NAME,
        userName: USER_NAME,
        email: EMAIL,
        password: PASSWORD
      };
      
      await userService.RegisterNewUser(newUserDto);

      expect(userRepository.FindUserByUserName).toHaveBeenCalledWith(USER_NAME);
    });

    test("Given existing username When registering new user Then throw existing username exception", async () => {
      userRepository.FindUserByUserName.mockResolvedValue({ userName: USER_NAME });
      let newUserDto: NewUserDto = {
            lastName: LAST_NAME,
            firstName: FIRST_NAME,
            userName: USER_NAME,
            email: EMAIL,
            password: PASSWORD
      };
      
      const promise = userService.RegisterNewUser(newUserDto);

      await expect(promise).rejects.toThrow("A user with this username already exists.")
    });

    test("Given new user info When registering this user Then call persistence layer", async () => {
      let newUserDto: NewUserDto = {
            lastName: LAST_NAME,
            firstName: FIRST_NAME,
            userName: USER_NAME,
            email: EMAIL,
            password: PASSWORD
      };
      
      await userService.RegisterNewUser(newUserDto);

      expect(userRepository.SaveUser).toHaveBeenCalledWith(newUserDto);
    });

    test("Given new user info When registering this user Then generate JWT token", async () => {
      let newUserDto: NewUserDto = {
            lastName: LAST_NAME,
            firstName: FIRST_NAME,
            userName: USER_NAME,
            email: EMAIL,
            password: PASSWORD
      };
      
      await userService.RegisterNewUser(newUserDto);

      expect(tokenService.GenerateToken).toHaveBeenCalledWith({email: EMAIL, role: USER_ROLE});
    });

    test("Given new user info When registering this user Then send confirmation email", async () => {
      let newUserDto: NewUserDto = {
            lastName: LAST_NAME,
            firstName: FIRST_NAME,
            userName: USER_NAME,
            email: EMAIL,
            password: PASSWORD
      };
      
      await userService.RegisterNewUser(newUserDto);

      expect(emailService.SendUserRegistrationMail).toHaveBeenCalledWith(EMAIL, FIRST_NAME, LAST_NAME);
    });

    test("Given new user info When registering this user Then return token", async () => {
      jest.spyOn(tokenService, "GenerateToken").mockReturnValue(TOKEN);
      let newUserDto: NewUserDto = {
            lastName: LAST_NAME,
            firstName: FIRST_NAME,
            userName: USER_NAME,
            email: EMAIL,
            password: PASSWORD
      };
      
      const token = await userService.RegisterNewUser(newUserDto);

      expect(token).toBe(TOKEN);
    });
  });

  describe("Logout", () => {
    test("Given a token When logging out Then verify that the token is blacklisted", async () => {
      await userService.Logout(TOKEN);

      expect(tokenService.IsBlacklisted).toHaveBeenCalledWith(TOKEN);
    });

    test("Given the token is not blacklisted When logging out Then persist it in the blacklist", async () => {
      jest.spyOn(tokenService, "IsBlacklisted").mockResolvedValue(false);

      await userService.Logout(TOKEN);

      expect(tokenService.SaveToken).toHaveBeenCalledWith(TOKEN);
    });

    test("Given the token is already blacklisted When logging out Then the operation is successful", async () => {
      jest.spyOn(tokenService, "IsBlacklisted").mockResolvedValue(true);

      await userService.Logout(TOKEN);

      expect(tokenService.SaveToken).toHaveBeenCalledTimes(0);
    });
  });
  
});
