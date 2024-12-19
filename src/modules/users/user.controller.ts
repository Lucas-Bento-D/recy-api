import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { ZodValidationPipe } from '@/shared/utils/zod-validation.pipe';

import { AuthorizationGuard } from '../authorization/authorization.guard';
import { CreateUserDto, CreateUserSchema } from './dtos/create-user.dto';
import { UpdateUserDto, UpdateUserSchema } from './dtos/update-user.dto';
import { ValidateUserDto } from './dtos/validate-user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthorizationGuard)
  @Post()
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthorizationGuard)
  @Get()
  @ApiResponse({ status: 200, description: 'List of all users' })
  async findAllUsers(): Promise<User[]> {
    return this.userService.findAllUsers();
  }

  @UseGuards(AuthorizationGuard)
  @Get(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user with the specified ID',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  @UseGuards(AuthorizationGuard)
  @Patch(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @UseGuards(AuthorizationGuard)
  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser(id);
  }

  @UseGuards(AuthorizationGuard)
  @Post('validate')
  @ApiResponse({
    status: 200,
    description: 'User validated or created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user details or failed validation.',
  })
  async validateUser(@Body() validateUserDto: ValidateUserDto) {
    return this.userService.validateUser(validateUserDto);
  }
}
