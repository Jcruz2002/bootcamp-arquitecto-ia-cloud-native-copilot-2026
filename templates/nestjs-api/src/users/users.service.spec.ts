import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('creates a user', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce({
      id: 1,
      email: 'john@example.com',
      name: 'John',
      isActive: true,
      roles: ['user'],
      passwordHash: 'hash',
    } as User);
    repository.save.mockResolvedValueOnce({
      id: 1,
      email: 'john@example.com',
      name: 'John',
      isActive: true,
      roles: ['user'],
      passwordHash: 'hash',
    } as User);

    const created = await service.create({
      email: 'john@example.com',
      name: 'John',
      password: 'secret123',
    });

    expect(created).toHaveProperty('email', 'john@example.com');
    expect(created).not.toHaveProperty('passwordHash');
  });

  it('fails if email already exists', async () => {
    repository.findOne.mockResolvedValueOnce({ id: 1 } as User);

    await expect(
      service.create({
        email: 'john@example.com',
        name: 'John',
        password: 'secret123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws not found on missing user', async () => {
    repository.findOne.mockResolvedValueOnce(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
