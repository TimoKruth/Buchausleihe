import { db } from 'baqend';

import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let originalBook: any;
  let originalBuchreihe: any;
  let originalAusleihen: any;

  beforeEach(() => {
    service = new FileService();
    originalBook = (db as any).Book;
    originalBuchreihe = (db as any).Buchreihe;
    originalAusleihen = (db as any).Ausleihen;
  });

  afterEach(() => {
    (db as any).Book = originalBook;
    (db as any).Buchreihe = originalBuchreihe;
    (db as any).Ausleihen = originalAusleihen;
  });

  it('queries books by category ordered by name', async () => {
    const result = [{ Name: 'A' }];
    const resultList = jasmine.createSpy('resultList').and.returnValue(Promise.resolve(result));
    const ascending = jasmine.createSpy('ascending').and.returnValue({ resultList });
    const eq = jasmine.createSpy('eq').and.returnValue({ ascending });

    (db as any).Book = {
      find: jasmine.createSpy('find').and.returnValue({ eq })
    };

    expect(await service.getBooksByKat('kat-5')).toEqual(result);
    expect((db as any).Book.find).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('Kategorie', 'kat-5');
    expect(ascending).toHaveBeenCalledWith('Name');
  });

  it('filters out student books when loading categories', async () => {
    const result = [{ name: 'Abenteuer' }];
    const resultList = jasmine.createSpy('resultList').and.returnValue(Promise.resolve(result));
    const ne = jasmine.createSpy('ne').and.returnValue({ resultList });
    const secondAscending = jasmine.createSpy('ascending').and.returnValue({ ne });
    const firstAscending = jasmine.createSpy('ascending').and.returnValue({ ascending: secondAscending });

    (db as any).Buchreihe = {
      find: jasmine.createSpy('find').and.returnValue({ ascending: firstAscending })
    };

    expect(await service.getKategorienOhneSchueler()).toEqual(result);
    expect(firstAscending).toHaveBeenCalledWith('name');
    expect(secondAscending).toHaveBeenCalledWith('Lesestufe');
    expect(ne).toHaveBeenCalledWith('name', 'Schülerbücher');
  });

  it('builds the recent lending count query', () => {
    const count = jasmine.createSpy('count').and.returnValue(Promise.resolve(1));
    const greaterThan = jasmine.createSpy('greaterThan').and.returnValue({ count });
    const where = jasmine.createSpy('where').and.returnValue({ greaterThan });

    (db as any).Ausleihen = {
      find: jasmine.createSpy('find').and.returnValue({ where })
    };

    service.getLastTwoWeeksAusleihenByBook('book-9');

    expect(where).toHaveBeenCalledWith({ book: 'book-9' });
    expect(greaterThan).toHaveBeenCalledWith('Ausleihen.Zeitpunkt', jasmine.any(Date));
  });
});
