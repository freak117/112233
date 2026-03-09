import { USERNAME_REGEX, normalizeUsername } from './username.util';

function expect(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function run(): void {
  expect(normalizeUsername('  Alice_01 ') === 'alice_01', 'normalizeUsername should trim/lowercase');
  expect(USERNAME_REGEX.test('valid_name_123'), 'USERNAME_REGEX should accept valid username');
  expect(!USERNAME_REGEX.test('no'), 'USERNAME_REGEX should reject too short username');
  expect(!USERNAME_REGEX.test('bad-name'), 'USERNAME_REGEX should reject invalid chars');
}

run();

