import { JwtCookieGuard } from './jwt-cookie.guard';

describe('JwtCookieGuard', () => {
  it('should be defined', () => {
    expect(new JwtCookieGuard()).toBeDefined();
  });
});
