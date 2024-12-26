import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { ulid } from 'ulid';

import { PrismaService } from '@/modules/prisma/prisma.service';
import { paginate, PaginatedResult } from '@/shared/utils/pagination.util';

import { ResidueType } from '../recycling-reports/dtos/residue-type.enum';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ValidateUserDto } from './dtos/validate-user.dto';
import { UserQueryParams } from './interface/user.types';
import { ValidateUserResponse } from './types';

interface Material {
  materialType: ResidueType;
  weightKg: number;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async checkUserExists(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, name, phone, walletAddress, roleIds, authId, authProvider } =
      createUserDto;

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
        authProvider,
        authId,
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
    this.checkUserExists(id);

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
    this.checkUserExists(id);

    return this.prisma.user.delete({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });
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

  async findAllUsers(params: UserQueryParams): Promise<PaginatedResult<User>> {
    return paginate<User>(
      () =>
        this.prisma.user.count({
          where: {},
        }),
      (skip, take) =>
        this.prisma.user.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            userRoles: { include: { role: true } },
            audits: true,
            recyclingReports: true,
          },
          where: {},
        }),
      params,
    );
  }

  async validateUser(
    validateUserDto: ValidateUserDto,
  ): Promise<ValidateUserResponse> {
    const { authId, email, name, picture, authProvider } = validateUserDto;

    // Check if a user exists with the same email
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    // If user exists by email but has different authId/authProvider, update the user
    if (existingUserByEmail) {
      if (
        existingUserByEmail.authId !== authId ||
        existingUserByEmail.authProvider !== authProvider
      ) {
        const updatedUser = await this.prisma.user.update({
          where: { email },
          data: {
            authId,
            authProvider,
            picture,
          },
        });
        return { userExists: true, user: updatedUser };
      }

      // If the email matches and authId/authProvider are the same, return the existing user
      return { userExists: true, user: existingUserByEmail };
    }

    // If no user exists with the same email, create a new user
    const newUser = await this.prisma.user.create({
      data: {
        email,
        name,
        authId,
        authProvider,
        picture,
      },
    });

    return { userExists: false, user: newUser };
  }

  async getStatsForUser(userId: string) {
    // Count the total number of reports submitted by the user
    const totalReports = await this.prisma.recyclingReport.count({
      where: { submittedBy: userId },
    });

    // Fetch all the user's reports (ordered by date)
    const allReports = await this.prisma.recyclingReport.findMany({
      where: { submittedBy: userId },
      orderBy: { reportDate: 'desc' },
      select: {
        id: true,
        reportDate: true,
        materials: true,
        audited: true,
        residueEvidence: true,
        metadata: true,
      },
    });

    // Function to calculate total weights for different types of materials
    const formattedMaterialTotals = (
      materials: { materialType: ResidueType; weightKg: number }[],
    ) => {
      const materialTotals = materials.reduce(
        (acc, { materialType, weightKg }) => {
          if (!acc[materialType]) acc[materialType] = 0;
          acc[materialType]! += weightKg;
          return acc;
        },
        {} as { [key in ResidueType]?: number },
      );

      // Return totals, rounding each value to 2 decimal places
      return Object.fromEntries(
        Object.entries(materialTotals).map(([key, value]) => [
          key as ResidueType,
          parseFloat(value!.toFixed(2)),
        ]),
      );
    };

    // Function to calculate total weight of reported residues
    const getTotalResidueKgsReported = (reports: any[]) => {
      let totalKg = 0;
      const residueMaterialWeights: { [key in ResidueType]: number } = {
        [ResidueType.GLASS]: 0,
        [ResidueType.METAL]: 0,
        [ResidueType.ORGANIC]: 0,
        [ResidueType.PAPER]: 0,
        [ResidueType.PLASTIC]: 0,
        [ResidueType.TEXTILE]: 0,
        [ResidueType.LANDFILL_WASTE]: 0,
      };

      // Sum the weights of materials in each report
      reports.forEach((report) => {
        const materialTotals = formattedMaterialTotals(report.materials);
        totalKg += Object.values(materialTotals).reduce(
          (sum, weight) => sum + (weight || 0),
          0,
        );
        for (const residueType of Object.keys(
          residueMaterialWeights,
        ) as ResidueType[]) {
          residueMaterialWeights[residueType] +=
            materialTotals[residueType] || 0;
        }
      });

      return { totalKg, residueMaterialWeights };
    };

    // Get the current month and the last month
    const currentMonth = new Date();
    const firstDayOfCurrentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const firstDayOfLastMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1,
    );
    const lastDayOfLastMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0,
    ); // last day of the previous month

    // Filter reports for the current month
    const currentMonthReports = allReports.filter((report) => {
      const reportDate = new Date(report.reportDate);
      return reportDate >= firstDayOfCurrentMonth;
    });

    // Filter reports for the last month
    const lastMonthReports = allReports.filter((report) => {
      const reportDate = new Date(report.reportDate);
      return (
        reportDate >= firstDayOfLastMonth && reportDate <= lastDayOfLastMonth
      );
    });

    // Calculate total residue for all reports (no filtering by month)
    const {
      totalKg: totalResidueKgAllReports,
      residueMaterialWeights: residueMaterialWeightsAllReports,
    } = getTotalResidueKgsReported(allReports);

    // Calculate total residue for the current month
    const {
      totalKg: totalKgCurrentMonth,
      residueMaterialWeights: residueMaterialWeightsCurrentMonth,
    } = getTotalResidueKgsReported(currentMonthReports);

    // Calculate total residue for the last month
    const {
      totalKg: totalKgLastMonth,
      residueMaterialWeights: residueMaterialWeightsLastMonth,
    } = getTotalResidueKgsReported(lastMonthReports);

    // Function to calculate the percentage change between current and previous values
    const calculateMonthlyChange = (current: number, previous: number) => {
      if (previous === 0) {
        return {
          percentage: current === 0 ? 0 : 100,
          changeType: current === 0 ? 'noChange' : 'increase',
        };
      }

      if (current === previous) {
        return {
          percentage: 0,
          changeType: 'noChange',
        };
      }

      const percentage = ((current - previous) / previous) * 100;
      let changeType: 'increase' | 'decrease' | 'noChange' = 'noChange';
      if (percentage > 0) changeType = 'increase';
      if (percentage < 0) changeType = 'decrease';

      return { percentage, changeType };
    };

    // Calculate percentage change for residues and reports
    const {
      percentage: percentageChangeResidueKgsMonthly,
      changeType: changeTypeResidueKgsMonthly,
    } = calculateMonthlyChange(totalKgCurrentMonth, totalKgLastMonth);

    const {
      percentage: percentageChangeReportsMonthly,
      changeType: changeTypeReportsMonthly,
    } = calculateMonthlyChange(
      currentMonthReports.length,
      lastMonthReports.length,
    );

    // Fetch the previous stats before update
    const previousStatsBeforeUpdate = await this.prisma.userHistory.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    // If no previous history exists, create a new entry; otherwise, update the existing one
    if (!previousStatsBeforeUpdate) {
      await this.prisma.userHistory.create({
        data: {
          userId,
          totalResidueKgs: totalResidueKgAllReports,
          totalReports: totalReports,
          percentageChangeResidueKgs: percentageChangeResidueKgsMonthly,
          percentageChangeReports: percentageChangeReportsMonthly,
        },
      });
    } else {
      await this.prisma.userHistory.update({
        where: { id: previousStatsBeforeUpdate.id },
        data: {
          totalResidueKgs: totalResidueKgAllReports,
          totalReports: totalReports,
          percentageChangeResidueKgs: percentageChangeResidueKgsMonthly,
          percentageChangeReports: percentageChangeReportsMonthly,
        },
      });
    }

    // Return the statistics for the user
    return {
      totalReports: totalReports,
      lastsReports: allReports.slice(0, 5),
      totalResidueKg: totalResidueKgAllReports,
      residueMaterialWeights: residueMaterialWeightsAllReports,
      monthlyChanges: {
        residueKgs: {
          percentageChange: percentageChangeResidueKgsMonthly,
          changeType: changeTypeResidueKgsMonthly,
        },
        reports: {
          percentageChange: percentageChangeReportsMonthly,
          changeType: changeTypeReportsMonthly,
        },
      },
    };
  }
}
