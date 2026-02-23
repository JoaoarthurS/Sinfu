/**
 * Exemplo de Teste Unitário
 * Demonstra como testar Use Cases com mocks
 */

import { LoginUseCase } from '../../../src/domain/useCases/LoginUseCase';
import { MockAuthRepository } from '../../../src/data/mocks/MockAuthRepository';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockAuthRepository: MockAuthRepository;

  beforeEach(() => {
    mockAuthRepository = new MockAuthRepository();
    loginUseCase = new LoginUseCase(mockAuthRepository);
  });

  it('should login successfully with valid credentials', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'user123',
    };

    const result = await loginUseCase.execute(credentials);

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(credentials.email);
    expect(result.token).toBeDefined();
  });

  it('should throw error with empty email', async () => {
    const credentials = {
      email: '',
      password: 'user123',
    };

    await expect(loginUseCase.execute(credentials)).rejects.toThrow(
      'Email e senha são obrigatórios'
    );
  });

  it('should throw error with invalid email', async () => {
    const credentials = {
      email: 'invalid-email',
      password: 'user123',
    };

    await expect(loginUseCase.execute(credentials)).rejects.toThrow(
      'Email inválido'
    );
  });

  it('should throw error with empty password', async () => {
    const credentials = {
      email: 'user@example.com',
      password: '',
    };

    await expect(loginUseCase.execute(credentials)).rejects.toThrow(
      'Email e senha são obrigatórios'
    );
  });

  it('should login as admin with admin credentials', async () => {
    const credentials = {
      email: 'admin@example.com',
      password: 'admin123',
    };

    const result = await loginUseCase.execute(credentials);

    expect(result.user.role).toBe('admin');
  });
});
