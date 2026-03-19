import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

jest.setTimeout(120000);

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken = '';

  beforeAll(async () => {
    process.env.DB_TYPE = 'sqljs';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '3600s';
    process.env.DEFAULT_ADMIN_EMAIL = 'admin@bootcamp.local';
    process.env.DEFAULT_ADMIN_PASSWORD = 'admin123';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) should return root payload', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
      });
  });

  it('/users (POST) should validate required fields', () => {
    return request(app.getHttpServer()).post('/users').send({ name: 'No Email' }).expect(400);
  });

  it('/users (POST) should create user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'student@example.com',
        name: 'Student',
        password: 'secret123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('email', 'student@example.com');
      });
  });

  it('/auth/login (POST) should return JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'student@example.com',
        password: 'secret123',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    accessToken = res.body.accessToken as string;
  });

  it('/auth/profile (GET) should return 401 without token', () => {
    return request(app.getHttpServer()).get('/auth/profile').expect(401);
  });

  it('/auth/profile (GET) should return 200 with token', () => {
    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('email', 'student@example.com');
      });
  });
});
