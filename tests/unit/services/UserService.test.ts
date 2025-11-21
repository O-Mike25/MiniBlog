import { UserService } from "../../../src/services/UserService";
import { IUserRepository } from "../../../src/repositories/interfaces/IUserRepository";
import { IEmailService } from "../../../src/services/EmailService/IEmailService";
import { TokenService } from "../../../src/services/TokenService";
import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { NewUserDto } from "../../../src/dtos/NewUserDto";
import { ITokenBlacklistRepository } from "../../../src/repositories/interfaces/ITokenBlacklistRepository";
import { ICryptoService } from "../../../src/services/CryptoService/ICryptoService";

describe("UserService", () => {
  const LAST_NAME = "Doe";
  const FIRST_NAME = "John";
  const USER_NAME = "john.doe";
  const EMAIL = "john.doe@example.com";
  const PASSWORD = "StrongPassword123!";
  const FAKE_PASSWORD = "fake password";
  const PASSWORD_HASH = "password hash";
  const SECRET_KEY = "fake secret key";
  const USER_ROLE = "user";
  const USER_ID = 1;
  const TOKEN = "eyJhbGci.ioiOjMDB9._XvU4pQHnIg";

  let userService: UserService;
  let userRepository: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let tokenBlacklistRepository: jest.Mocked<ITokenBlacklistRepository>
  let tokenService: TokenService;
  let cryptoService: jest.Mocked<ICryptoService>;

  beforeEach(() => {
    userRepository = {
      FindUserByEmail: jest.fn(),
      FindUserByUserName: jest.fn(),
      SaveUser: jest.fn(),
      GetUser: jest.fn(),
      UpdateUser: jest.fn(),
      DeleteUser: jest.fn()
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

    cryptoService = {
      Hash: jest.fn(),
      Compare: jest.fn()
    }

    userService = new UserService(userRepository, emailService, tokenService, cryptoService);
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

      await expect(promise).rejects.toThrow("A user with this username already exists.");
    });

    test("Given non existing user When registering this user Then encrypt password", async () => {
      let newUserDto: NewUserDto = {
            lastName: LAST_NAME,
            firstName: FIRST_NAME,
            userName: USER_NAME,
            email: EMAIL,
            password: PASSWORD
      };
      
      await userService.RegisterNewUser(newUserDto);

      expect(cryptoService.Hash).toHaveBeenCalledWith(PASSWORD);
    });

    test("Given non existing user When registering this user Then call persistence layer", async () => {
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

    test("Given non existing user When registering this user Then generate JWT token", async () => {
      userRepository.SaveUser.mockResolvedValue(USER_ID);
      let newUserDto: NewUserDto = {
            lastName: LAST_NAME,
            firstName: FIRST_NAME,
            userName: USER_NAME,
            email: EMAIL,
            password: PASSWORD
      };
      
      await userService.RegisterNewUser(newUserDto);

      expect(tokenService.GenerateToken).toHaveBeenCalledWith({userId: USER_ID, username: USER_NAME, role: USER_ROLE});
    });

    test("Given non existing user When registering this user Then send confirmation email", async () => {
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

    test("Given non existing user When registering this user Then return token", async () => {
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

  describe("Login", () => {
    beforeEach(() => {
      userRepository.FindUserByEmail.mockResolvedValue({userName:USER_NAME, password: PASSWORD_HASH});
      cryptoService.Compare.mockResolvedValue(true);
    })

    test("Given user infos When logging in Then retrieve user", async () => {
      await userService.Login(EMAIL, PASSWORD);

      expect(userRepository.FindUserByEmail).toHaveBeenCalledWith(EMAIL);
    });

    test("Given user doesn't exist When logging in Then return invalid credentials exception", async () => {
      userRepository.FindUserByEmail.mockResolvedValue(null);

      const promise = userService.Login(EMAIL, PASSWORD);

      await expect(promise).rejects.toThrow("The email or password is not correct");
    });

    test("Given user exists When logging in Then verify password", async () => {
      await userService.Login(EMAIL, PASSWORD);

      expect(cryptoService.Compare).toHaveBeenCalledWith(PASSWORD, PASSWORD_HASH);
    });

    test("Given invalid password When logging in Then return invalid credentials exception", async () => {
      cryptoService.Compare.mockResolvedValue(false);

      const promise =  userService.Login(EMAIL, PASSWORD);

      await expect(promise).rejects.toThrow("The email or password is not correct");
    });

    test("Given correct password When logging in Then generate token", async () => {
      userRepository.FindUserByEmail.mockResolvedValue({userId: USER_ID, userName: USER_NAME, role: USER_ROLE});

      await userService.Login(EMAIL, PASSWORD);

      expect(tokenService.GenerateToken).toHaveBeenCalledWith({userId: USER_ID, username: USER_NAME, role: USER_ROLE});
    });

    test("Given correct password When logging in Then return token", async () => {
      jest.spyOn(tokenService, "GenerateToken").mockReturnValue(TOKEN);

      let token = await userService.Login(EMAIL, PASSWORD)

      expect(token).toBe(TOKEN);
    });
  })

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
  
  describe("GetUserProfile", () => {
    test("Given user id When fetching an user profile Then call persistance", async () => {
      await userService.GetUserProfile(USER_ID);

      expect(userRepository.GetUser).toHaveBeenCalledWith(USER_ID);
    })

    test("Given existing user When fetching an user profile Then return user profile", async () => {
      let expectedUser = { userId: USER_ID }
      userRepository.GetUser.mockResolvedValue(expectedUser);

      let obtainedUser = await userService.GetUserProfile(USER_ID);

      expect(obtainedUser).toBe(expectedUser);
    })
  })

  describe("UpdateUserProfile", () => {
    test("Given a user id When updating the user's profile Then retrieve the user", async () => {
      userRepository.GetUser.mockResolvedValue({userId: USER_ID});
      let newUserInfos = {
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        userName: USER_NAME,
        email: EMAIL,
        password: PASSWORD
      }

      await userService.UpdateUserProfile(USER_ID, newUserInfos);

      expect(userRepository.GetUser).toHaveBeenCalledWith(USER_ID);
    })

    test("Given new user information When updating the user profile Then update the user in the persistance", async () => {
      userRepository.GetUser.mockResolvedValue({userId: USER_ID});
      let newUserInfos = {
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        userName: USER_NAME,
        email: EMAIL,
        password: PASSWORD
      }

      await userService.UpdateUserProfile(USER_ID, newUserInfos);

      expect(userRepository.GetUser).toHaveBeenCalledWith(USER_ID);
    })
  })

  describe("DeleteUser", () => {
    test("Given a user id When deleting a user profile Then retrieves the user", async () => {
      userRepository.GetUser.mockResolvedValue({userId: USER_ID});

      await userService.DeleteUser(USER_ID);

      expect(userRepository.GetUser).toHaveBeenCalledWith(USER_ID);
    })

    test("Given a user id When deleting a user profile Then delete the user from persistance", async () => {
      userRepository.GetUser.mockResolvedValue({userId: USER_ID});

      await userService.DeleteUser(USER_ID);

      expect(userRepository.DeleteUser).toHaveBeenCalledWith(USER_ID);
    })
  })
});
