import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { ulid } from 'ulid';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, name, phone, walletAddress, roleIds } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists.`);
    }

    // Fetch roles by roleIds to check for "admin" role and other validations
    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
    });

    // Check if the "admin" role is being assigned
    const hasAdminRole = roles.some((role) => role.name === 'admin');
    if (hasAdminRole) {
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
      throw new ForbiddenException(
        'Waste Generators or Partners can only be assigned the "Auditor" role in addition to their main role.',
      );
    }

    if (hasAuditorRole && !(hasWasteGeneratorRole || hasPartnerRole)) {
      throw new ForbiddenException(
        'Only Waste Generators or Partners can be assigned the "Auditor" role.',
      );
    }

    // Generate ULID for the new user ID
    const userId = ulid();

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

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    const { roleIds, ...updateData } = updateUserDto;

    // Fetch roles by roleIds to check for "admin" role and other validations
    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
    });

    // Check if the "admin" role is being assigned
    const hasAdminRole = roles.some((role) => role.name === 'admin');
    if (hasAdminRole) {
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
      throw new ForbiddenException(
        'Waste Generators or Partners can only be assigned the "Auditor" role in addition to their main role.',
      );
    }

    if (hasAuditorRole && !(hasWasteGeneratorRole || hasPartnerRole)) {
      throw new ForbiddenException(
        'Only Waste Generators or Partners can be assigned the "Auditor" role.',
      );
    }

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

    return updatedUser;
  }

  async deleteUser(id: string): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return this.prisma.user.delete({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: { include: { role: true } },
        audits: true,
        recyclingReports: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }

    return user;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: { include: { role: true } },
        audits: true,
        recyclingReports: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }

  async findAllUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      include: {
        userRoles: { include: { role: true } },
        audits: true,
        recyclingReports: true,
      },
    });

    return users;
  }
}
