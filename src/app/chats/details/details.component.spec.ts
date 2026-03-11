import { BehaviorSubject } from 'rxjs';

import { db } from 'baqend';

import { DetailsComponent } from './details.component';

async function flushPromises(times = 3): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

describe('DetailsComponent', () => {
  let route: any;
  let component: DetailsComponent;
  let originalMessage: any;
  let originalFile: any;

  beforeEach(() => {
    route = {
      params: new BehaviorSubject({ id: 'message-1' })
    };
    component = new DetailsComponent(route);
    originalMessage = (db as any).Message;
    originalFile = (db as any).File;
  });

  afterEach(() => {
    (db as any).Message = originalMessage;
    (db as any).File = originalFile;
  });

  it('loads the selected message from the route id', async () => {
    const message = { id: 'message-1', text: 'Hallo' };

    (db as any).Message = {
      load: jasmine.createSpy('load').and.returnValue(Promise.resolve(message))
    };

    component.ngOnInit();
    await flushPromises();

    expect((db as any).Message.load).toHaveBeenCalledWith('message-1');
    expect(component.message).toEqual(message as any);
  });

  it('builds image URLs from Baqend files', () => {
    (db as any).File = jasmine.createSpy('File').and.returnValue({ url: '/images/user.png' });

    expect(component.getImageUrl({ face: 'faces/user.png' })).toBe('/images/user.png');
  });
});
