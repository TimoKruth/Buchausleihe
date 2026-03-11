import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';

import { db } from 'baqend';

import { MeComponent } from './me.component';

async function flushPromises(times = 4): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

describe('MeComponent', () => {
  let component: MeComponent;
  let router: jasmine.SpyObj<any>;
  let files: jasmine.SpyObj<any>;
  let originalUser: any;
  let originalBook: any;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    files = jasmine.createSpyObj('FileService', [
      'getVerlieheneBooks',
      'getKategorien'
    ]);
    component = new MeComponent(router, files);
    originalUser = (db as any).User;
    originalBook = (db as any).Book;
  });

  afterEach(() => {
    (db as any).User = originalUser;
    (db as any).Book = originalBook;
  });

  it('loads the current user, borrowed books and categories on init', async () => {
    const currentUser = { username: 'tim' };
    const books = [{ Name: 'Atlas' }];
    const categories = [{ name: 'Abenteuer' }];
    const freshBook = { created: true };

    (db as any).User = { me: currentUser };
    (db as any).Book = jasmine.createSpy('Book').and.returnValue(freshBook);
    files.getVerlieheneBooks.and.returnValue(Promise.resolve(books));
    files.getKategorien.and.returnValue(Promise.resolve(categories));

    component.ngOnInit();
    await flushPromises();

    expect(component.me as any).toBe(currentUser as any);
    expect(component.books).toEqual(books);
    expect(component.kats).toEqual(categories);
    expect(component.newBook).toBe(freshBook);
  });

  it('marks a returned book as available again', async () => {
    const update = jasmine.createSpy('update');
    const bookRecord = { Anzahl: 0, Verliehen: true, update };
    const singleResult = jasmine.createSpy('singleResult').and.returnValue(Promise.resolve(bookRecord));
    const eq = jasmine.createSpy('eq').and.returnValue({ singleResult });

    component.books = [{ id: 'book-1' }];
    (db as any).Book = {
      find: jasmine.createSpy('find').and.returnValue({ eq })
    };

    component.gotBookBack(0);
    await flushPromises();

    expect(eq).toHaveBeenCalledWith('id', 'book-1');
    expect(bookRecord.Anzahl).toBe(1);
    expect(bookRecord.Verliehen).toBeFalse();
    expect(update).toHaveBeenCalled();
  });

  it('resets the form after adding a book and clears the success state later', fakeAsync(() => {
    const freshBook = { fresh: true };

    component.newBook = {
      insert: jasmine.createSpy('insert').and.returnValue(Promise.resolve())
    };
    (db as any).Book = jasmine.createSpy('Book').and.returnValue(freshBook);

    component.add();
    flushMicrotasks();

    expect(component.newBook).toBe(freshBook);
    expect(component.succeeded).toBeTrue();

    tick(9000);

    expect(component.succeeded).toBeFalse();
  }));

  it('logs out and navigates back to the root page', async () => {
    (db as any).User = {
      logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve())
    };

    component.logout();
    await flushPromises();

    expect((db as any).User.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
