import { normalizeUsername, buildDirectChatKey, USERNAME_REGEX } from './username.util';

describe('Username Utils (Unit)', () => {
  describe('normalizeUsername', () => {
    it('должен приводить к нижнему регистру', () => {
      expect(normalizeUsername('TestUser')).toBe('testuser');
      expect(normalizeUsername('TEST_USER')).toBe('test_user');
    });

    it('должен обрезать пробелы', () => {
      expect(normalizeUsername('  testuser  ')).toBe('testuser');
      expect(normalizeUsername(' test_user ')).toBe('test_user');
    });

    it('должен комбинировать trim и lowercase', () => {
      expect(normalizeUsername('  TestUser  ')).toBe('testuser');
    });
  });

  describe('USERNAME_REGEX', () => {
    it('должен принимать валидные username 4-32 символа', () => {
      expect(USERNAME_REGEX.test('test')).toBe(true);
      expect(USERNAME_REGEX.test('test_user')).toBe(true);
      expect(USERNAME_REGEX.test('test123')).toBe(true);
      expect(USERNAME_REGEX.test('a'.repeat(32))).toBe(true);
    });

    it('должен отклонять username короче 4 символов', () => {
      expect(USERNAME_REGEX.test('abc')).toBe(false);
      expect(USERNAME_REGEX.test('ab')).toBe(false);
      expect(USERNAME_REGEX.test('a')).toBe(false);
    });

    it('должен отклонять username длиннее 32 символов', () => {
      expect(USERNAME_REGEX.test('a'.repeat(33))).toBe(false);
      expect(USERNAME_REGEX.test('a'.repeat(40))).toBe(false);
    });

    it('должен отклонять специальные символы', () => {
      expect(USERNAME_REGEX.test('test-user')).toBe(false);
      expect(USERNAME_REGEX.test('test.user')).toBe(false);
      expect(USERNAME_REGEX.test('test user')).toBe(false);
      expect(USERNAME_REGEX.test('тест')).toBe(false);
    });
  });

  describe('buildDirectChatKey', () => {
    it('должен сортировать user id для уникальности ключа', () => {
      const key1 = buildDirectChatKey('user-a', 'user-b');
      const key2 = buildDirectChatKey('user-b', 'user-a');
      expect(key1).toBe(key2);
    });

    it('должен создавать одинаковый ключ независимо от порядка', () => {
      expect(buildDirectChatKey('123', '456')).toBe('123:456');
      expect(buildDirectChatKey('456', '123')).toBe('123:456');
    });

    it('должен работать с одинаковыми id', () => {
      expect(buildDirectChatKey('same', 'same')).toBe('same:same');
    });
  });
});
