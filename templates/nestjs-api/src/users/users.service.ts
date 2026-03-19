import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private toSafeUser(user: User): Omit<User, 'passwordHash'> {
    const safeUser = { ...user };
    delete (safeUser as Partial<User>).passwordHash;
    return safeUser as Omit<User, 'passwordHash'>;
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const exists = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      isActive: createUserDto.isActive ?? true,
      roles: ['user'],
      passwordHash,
    });

    const created = await this.usersRepository.save(user);
    return this.toSafeUser(created);
  }

  async findAll(page = 1, limit = 10) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const [rows, total] = await this.usersRepository.findAndCount({
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      order: { id: 'ASC' },
    });

    const data = rows.map((row) => this.toSafeUser(row));
    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const exists = await this.usersRepository.findOne({ where: { email: updateUserDto.email } });
      if (exists) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (typeof updateUserDto.email === 'string') {
      user.email = updateUserDto.email;
    }

    if (typeof updateUserDto.name === 'string') {
      user.name = updateUserDto.name;
    }

    if (typeof updateUserDto.isActive === 'boolean') {
      user.isActive = updateUserDto.isActive;
    }

    const updated = await this.usersRepository.save(user);
    return this.toSafeUser(updated);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.usersRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('User not found');
    }

    return { deleted: true };
  }

  async assignRoles(id: number, roles: string[]): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.roles = roles;
    await this.usersRepository.save(user);
  }
}
