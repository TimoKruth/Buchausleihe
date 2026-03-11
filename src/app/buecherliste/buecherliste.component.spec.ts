import { of } from 'rxjs';

import db from 'baqend';

import {
  BuecherlisteComponent,
  NgbdSortableHeader,
  SortEvent
} from './buecherliste.component';

async function flushPromises(times = 4): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

describe('BuecherlisteComponent', () => {
  let component: BuecherlisteComponent;
  let files: jasmine.SpyObj<any>;
  let http: jasmine.SpyObj<any>;
  let originalAusleihen: any;

  beforeEach(() => {
    files = jasmine.createSpyObj('FileService', [
      'getKategorienOhneSchueler',
      'getKatSchueler',
      'getBooksByKat',
      'getLastTwoWeeksAusleihenByBook',
      'getBook'
    ]);
    http = jasmine.createSpyObj('HttpClient', ['post']);
    http.post.and.returnValue(of({ ok: true }));

    component = new BuecherlisteComponent(files, http);
    originalAusleihen = (db as any).Ausleihen;
  });

  afterEach(() => {
    (db as any).Ausleihen = originalAusleihen;
  });

  it('loads categories and their books on init', async () => {
    const regularCategory = { id: 'kat-1', Name: 'Abenteuer' };
    const studentCategory = { id: 'kat-2', Name: 'Schuelerbuecher' };
    const firstBooks = [{ Name: 'Alpha', Kategorie: { id: 'kat-1' } }];
    const secondBooks = [{ Name: 'Beta', Kategorie: { id: 'kat-2' } }];

    files.getKategorienOhneSchueler.and.returnValue(Promise.resolve([regularCategory]));
    files.getKatSchueler.and.returnValue(Promise.resolve(studentCategory));
    files.getBooksByKat.and.callFake((categoryId: string) => {
      if (categoryId === 'kat-1') {
        return Promise.resolve(firstBooks);
      }

      return Promise.resolve(secondBooks);
    });

    component.ngOnInit();
    await flushPromises();

    expect(component.kats as any).toEqual([regularCategory, studentCategory] as any);
    expect(files.getBooksByKat).toHaveBeenCalledWith('kat-1');
    expect(files.getBooksByKat).toHaveBeenCalledWith('kat-2');
    expect(component.books['kat-1']).toEqual(firstBooks);
    expect(component.books['kat-2']).toEqual(secondBooks);
  });

  it('only proceeds with lending when the book was not recently borrowed', async () => {
    const lendSpy = spyOn(component, 'buchAusleihen');
    files.getLastTwoWeeksAusleihenByBook.and.returnValue(Promise.resolve(0));

    component.ausleihen('book-1');
    await flushPromises();

    expect(lendSpy).toHaveBeenCalledWith('book-1');

    lendSpy.calls.reset();
    files.getLastTwoWeeksAusleihenByBook.and.returnValue(Promise.resolve(2));

    component.ausleihen('book-2');
    await flushPromises();

    expect(lendSpy).not.toHaveBeenCalled();
  });

  it('updates the book, creates a lending entry and sends a mail', async () => {
    const update = jasmine.createSpy('update');
    const insert = jasmine.createSpy('insert');
    const sendMail = spyOn(component, 'sendAusleiheMail');
    const book = {
      Name: 'Die Geschichte',
      Verliehen: false,
      Anzahl: 1,
      update
    };

    component.schueler = 'Mila';
    files.getBook.and.returnValue(Promise.resolve(book));
    (db as any).Ausleihen = jasmine.createSpy('Ausleihen').and.callFake(function(payload: any) {
      this.insert = insert;
      this.payload = payload;
    });

    component.buchAusleihen('book-3');
    await flushPromises();

    expect(book.Verliehen).toBeTrue();
    expect(book.Anzahl).toBe(0);
    expect(update).toHaveBeenCalled();
    expect((db as any).Ausleihen).toHaveBeenCalled();
    expect(insert).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith(book);
  });

  it('posts the lending notification to Formspree', () => {
    component.schueler = 'Jonas';

    component.sendAusleiheMail({ Name: 'Atlas' });

    expect(http.post).toHaveBeenCalledWith('https://formspree.io/mzbjedjk', {
      name: 'Jonas hat Buch ausgeliehen: Atlas'
    });
  });

  it('sorts the categories and resets non-active headers', () => {
    const headers = [
      { sortable: 'Name', direction: 'asc' },
      { sortable: 'Autor', direction: 'desc' }
    ];
    const event: SortEvent = { column: 'Name', direction: 'asc' };

    component.kats = [{ Name: 'B' }, { Name: 'A' }] as any;
    component.headers = {
      forEach: (callback: (header: any) => void) => headers.forEach(callback)
    } as any;

    component.onSort(event);

    expect(headers[0].direction).toBe('asc');
    expect(headers[1].direction).toBe('');
    expect(component.kats.map((category: any) => category.Name)).toEqual(['A', 'B']);
  });
});

describe('NgbdSortableHeader', () => {
  it('rotates through the sort directions and emits the new state', () => {
    const directive = new NgbdSortableHeader();
    const emitted: SortEvent[] = [];

    directive.sortable = 'Name';
    directive.sort.subscribe((event) => emitted.push(event));

    directive.rotate();
    directive.rotate();

    expect(emitted).toEqual([
      { column: 'Name', direction: 'asc' },
      { column: 'Name', direction: 'desc' }
    ]);
  });
});
