import { Injectable, NotFoundException } from '@nestjs/common';
import {
  convertBytesToUuid,
  convertUuidToBytes,
} from '../../common/utils/uuid.util';
import { PrismaService } from '../../models/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

import { getChangedFields } from '../../common/utils/check-changed-fields.util';
import { createHashedPassword } from '../../common/utils/hash-password.util';

interface UserUpdateData {
  updatedAt: Date;
  name?: string;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private prepareUpdateData(changedFields: { name?: string }): UserUpdateData {
    const updateData: UserUpdateData = {
      updatedAt: new Date(),
    };

    if (changedFields.name) updateData.name = changedFields.name;

    return updateData;
  }

  async create(params: { name: string; email: string; password: string }) {
    const { name, email, password } = params;

    const uuid = uuidv4();
    const hashedPassword = await createHashedPassword(password);

    const userCreated = await this.prisma.user.create({
      data: {
        id: convertUuidToBytes(uuid),
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    return userCreated;
  }

  async get(params: { id: string }) {
    const { id } = params;

    const user = await this.prisma.user.findUnique({
      where: {
        id: convertUuidToBytes(id),
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const userReturn = {
      ...user,
      id: convertBytesToUuid(user.id),
    };

    return userReturn;
  }

  async getUserByEmail(params: { email: string }) {
    const { email } = params;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async put(params: { id: string; name: string }) {
    const { id, ...updates } = params;

    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: convertUuidToBytes(id),
      },
    });

    if (!currentUser) throw new NotFoundException('User not found');

    const changedFields = getChangedFields(
      {
        name: currentUser.name,
      },
      updates,
    );

    if (Object.keys(changedFields).length > 0) {
      const updateData = this.prepareUpdateData(changedFields);

      await this.prisma.user.update({
        where: {
          id: convertUuidToBytes(id),
        },
        data: updateData,
      });
    }
  }

  async delete(params: { id: string }) {
    const { id } = params;
    await this.prisma.user.delete({
      where: {
        id: convertUuidToBytes(id),
      },
    });
  }
}
