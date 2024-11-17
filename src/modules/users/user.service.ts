import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ulid } from 'ulid';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  private async checkUserExistsById(id: string): Promise<User> {
    this.logger.log(
      `Checking if user exists with ID: ${id}`,
      'UserService - checkUserExistsById',
    );
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      this.logger.warn(
        `User with ID ${id} not found`,
        'UserService - checkUserExistsById',
      );
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }

  private async checkUserExistsByEmail(email: string): Promise<User | null> {
    this.logger.log(
      `Checking if user exists with email: ${email}`,
      'UserService - checkUserExistsByEmail',
    );
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, name, phone, walletAddress, roleIds } = createUserDto;

    this.logger.log(
      `Starting user creation for email: ${email}`,
      'UserService - createUser',
    );

    const existingUser = await this.checkUserExistsByEmail(email);

    if (existingUser) {
      this.logger.warn(
        `User with email ${email} already exists`,
        'UserService - createUser',
      );
      throw new ConflictException(`User with email ${email} already exists.`);
    }

    // Fetch roles by roleIds to check for "admin" role and other validations
    this.logger.log(
      `Fetching roles for role IDs: ${roleIds}`,
      'UserService - createUser',
    );
    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
    });

    // Check if the "admin" role is being assigned
    const hasAdminRole = roles.some((role) => role.name === 'admin');
    if (hasAdminRole) {
      this.logger.warn(
        `Attempt to assign "admin" role to user with email: ${email}`,
        'UserService - createUser',
      );
      throw new ForbiddenException(
        'You are not allowed to assign the "admin" role.',
      );
    }

    // Check for "Waste Generator" or "Partner" roles and "Auditor" role restrictions
    const hasWasteGeneratorRole = roles.some(
      (role) => role.name === 'Waste Generator',
    );
    const hasPartnerRole = roles.some((role) => role.name === 'Partner');
    const hasAuditorRole = roles.some((role) => role.name === 'Auditor');

    if ((hasWasteGeneratorRole || hasPartnerRole) && !hasAuditorRole) {
      this.logger.warn(
        `Invalid role assignment for user with email: ${email}`,
        'UserService - createUser',
      );
      throw new ForbiddenException(
        'Waste Generators or Partners can only be assigned the "Auditor" role in addition to their main role.',
      );
    }

    if (hasAuditorRole && !(hasWasteGeneratorRole || hasPartnerRole)) {
      this.logger.warn(
        `Invalid role assignment: "Auditor" role without main role for user with email: ${email}`,
        'UserService - createUser',
      );
      throw new ForbiddenException(
        'Only Waste Generators or Partners can be assigned the "Auditor" role.',
      );
    }

    // Generate ULID for the new user ID
    const userId = ulid();

    this.logger.log(
      `Creating user with ID: ${userId}`,
      'UserService - createUser',
    );

    // Proceed with user creation if all validations pass
    const user = await this.prisma.user.create({
      data: {
        id: userId, // Set the generated ULID as the user ID
        email,
        name,
        phone,
        walletAddress,
        userRoles: {
          create: roleIds.map((roleId) => ({
            role: { connect: { id: roleId } },
          })),
        },
      },
      include: { userRoles: { include: { role: true } } },
    });

    this.logger.log(
      `User created successfully with ID: ${user.id}`,
      'UserService - createUser',
    );

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(
      `Starting update for user with ID: ${id}`,
      'UserService - updateUser',
    );

    await this.checkUserExistsById(id);

    const { roleIds, ...updateData } = updateUserDto;

    let roles = [];
    if (roleIds && roleIds.length > 0) {
      // Fetch roles by roleIds to check for "admin" role and other validations
      this.logger.log(
        `Fetching roles for role IDs: ${roleIds}`,
        'UserService - updateUser',
      );
      roles = await this.prisma.role.findMany({
        where: { id: { in: roleIds } },
      });

      // Check if the "admin" role is being assigned
      const hasAdminRole = roles.some((role) => role.name === 'admin');
      if (hasAdminRole) {
        this.logger.warn(
          `Attempt to assign "admin" role to user with ID: ${id}`,
          'UserService - updateUser',
        );
        throw new ForbiddenException(
          'You are not allowed to assign the "admin" role.',
        );
      }

      // Check for "Waste Generator" or "Partner" roles and "Auditor" role restrictions
      const hasWasteGeneratorRole = roles.some(
        (role) => role.name === 'Waste Generator',
      );
      const hasPartnerRole = roles.some((role) => role.name === 'Partner');
      const hasAuditorRole = roles.some((role) => role.name === 'Auditor');

      if ((hasWasteGeneratorRole || hasPartnerRole) && !hasAuditorRole) {
        this.logger.warn(
          `Invalid role assignment for user with ID: ${id}`,
          'UserService - updateUser',
        );
        throw new ForbiddenException(
          'Waste Generators or Partners can only be assigned the "Auditor" role in addition to their main role.',
        );
      }

      if (hasAuditorRole && !(hasWasteGeneratorRole || hasPartnerRole)) {
        this.logger.warn(
          `Invalid role assignment: "Auditor" role without main role for user with ID: ${id}`,
          'UserService - updateUser',
        );
        throw new ForbiddenException(
          'Only Waste Generators or Partners can be assigned the "Auditor" role.',
        );
      }
    }

    this.logger.log(`Updating user with ID: ${id}`, 'UserService - updateUser');

    // Proceed with user update if all validations pass
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        userRoles: {
          deleteMany: {},
          create: roleIds?.map((roleId) => ({
            role: { connect: { id: roleId } },
          })),
        },
      },
      include: { userRoles: { include: { role: true } } },
    });
    this.logger.log(
      `User with ID: ${id} updated successfully`,
      'UserService - updateUser',
    );

    return updatedUser;
  }

  async deleteUser(id: string): Promise<User> {
    this.logger.log(`Deleting user with ID: ${id}`, 'UserService - deleteUser');

    await this.checkUserExistsById(id);

    const deletedUser = await this.prisma.user.delete({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    this.logger.log(
      `User with ID: ${id} deleted successfully`,
      'UserService - deleteUser',
    );

    return deletedUser;
  }

  async findUserByEmail(email: string): Promise<User> {
    this.logger.log(
      `Finding user with email: ${email}`,
      'UserService - findUserByEmail',
    );

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: { include: { role: true } },
        audits: true,
        recyclingReports: true,
      },
    });

    if (!user) {
      this.logger.warn(
        `User with email ${email} not found`,
        'UserService - findUserByEmail',
      );
      throw new NotFoundException(`User with email ${email} not found.`);
    }

    this.logger.log(
      `User with email ${email} found`,
      'UserService - findUserByEmail',
    );

    return user;
  }

  async findUserById(id: string): Promise<User> {
    this.logger.log(
      `Finding user with ID: ${id}`,
      'UserService - findUserById',
    );

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: { include: { role: true } },
        audits: true,
        recyclingReports: true,
      },
    });

    if (!user) {
      this.logger.warn(
        `User with ID ${id} not found`,
        'UserService - findUserById',
      );
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    this.logger.log(`User with ID ${id} found`, 'UserService - findUserById');

    return user;
  }

  async findAllUsers(): Promise<User[]> {
    this.logger.log('Retrieving all users', 'UserService - findAllUsers');

    const users = await this.prisma.user.findMany({
      include: {
        userRoles: { include: { role: true } },
        audits: true,
        recyclingReports: true,
      },
    });

    this.logger.log(
      `Retrieved ${users.length} users`,
      'UserService - findAllUsers',
    );

    return users;
  }
}
