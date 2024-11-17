import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { ZodValidationPipe } from '@/shared/utils/zod-validation.pipe';

import { AuthorizationGuard } from '../authorization/authorization.guard';
import {
  CreateUserDto,
  CreateUserSchema,
  CreateUserSwaggerDto,
} from './dtos/create-user.dto';
import {
  UpdateUserDto,
  UpdateUserSchema,
  UpdateUserSwaggerDto,
} from './dtos/update-user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller({ path: 'users', version: '1' })
// @UseGuards(AuthorizationGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  @ApiBody({ type: CreateUserSwaggerDto })
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log('Creating a new user', 'UserController - createUser');

    const user = await this.userService.createUser(createUserDto);

    this.logger.log(
      `User successfully created with ID: ${user.id}`,
      'UserController - createUser',
    );

    return user;
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of all users' })
  async findAllUsers(): Promise<User[]> {
    this.logger.log('Retrieving all users', 'UserController - findAllUsers');

    const users = await this.userService.findAllUsers();

    this.logger.log(
      `Successfully retrieved ${users.length} users`,
      'UserController - findAllUsers',
    );

    return users;
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user with the specified ID',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserById(@Param('id') id: string): Promise<User> {
    this.logger.log(
      `Retrieving user with ID: ${id}`,
      'UserController - findUserById',
    );

    const user = await this.userService.findUserById(id);

    this.logger.log(
      `Successfully retrieved user with ID: ${id}`,
      'UserController - findUserById',
    );

    return user;
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: UpdateUserSwaggerDto })
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    this.logger.log(
      `Updating user with ID: ${id}`,
      'UserController - updateUser',
    );

    const user = await this.userService.updateUser(id, updateUserDto);

    this.logger.log(
      `User with ID: ${id} successfully updated`,
      'UserController - updateUser',
    );

    return user;
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string): Promise<User> {
    this.logger.log(
      `Deleting user with ID: ${id}`,
      'UserController - deleteUser',
    );

    const user = await this.userService.deleteUser(id);

    this.logger.log(
      `User with ID: ${id} successfully deleted`,
      'UserController - deleteUser',
    );

    return user;
  }

  @Get('email')
  @ApiQuery({ name: 'email', type: 'string', description: 'User email' })
  @ApiResponse({
    status: 200,
    description: 'The user with the specified email',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserByEmail(@Query('email') email: string): Promise<User> {
    this.logger.log(
      `Retrieving user with email: ${email}`,
      'UserController - findUserByEmail',
    );

    const user = await this.userService.findUserByEmail(email);

    this.logger.log(
      `Successfully retrieved user with email: ${email}`,
      'UserController - findUserByEmail',
    );

    return user;
  }
}
