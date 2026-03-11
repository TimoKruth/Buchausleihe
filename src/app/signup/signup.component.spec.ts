import { db } from 'baqend';

import { SignupComponent } from './signup.component';

async function flushPromises(times = 3): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

describe('SignupComponent', () => {
  let router: jasmine.SpyObj<any>;
  let originalUser: any;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    originalUser = (db as any).User;
  });

  afterEach(() => {
    (db as any).User = originalUser;
  });

  it('redirects to the profile page when a user is already logged in', () => {
    (db as any).User = { me: { username: 'tim' } };

    new SignupComponent(router);

    expect(router.navigate).toHaveBeenCalledWith(['/signup/me']);
  });

  it('registers and navigates to the profile page', async () => {
    (db as any).User = {
      me: null,
      register: jasmine.createSpy('register').and.returnValue(Promise.resolve())
    };
    const component = new SignupComponent(router);
    component.user = { name: 'tim', password: 'secret' };

    component.register();
    await flushPromises();

    expect((db as any).User.register).toHaveBeenCalledWith('tim', 'secret');
    expect(router.navigate).toHaveBeenCalledWith(['/signup/me']);
  });

  it('stores the backend error when login fails', async () => {
    (db as any).User = {
      me: null,
      login: jasmine.createSpy('login').and.returnValue(Promise.reject({ message: 'Invalid credentials' }))
    };
    const component = new SignupComponent(router);
    component.user = { name: 'tim', password: 'wrong' };

    component.logIn();
    await flushPromises();

    expect(component.error).toBe('Invalid credentials');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
