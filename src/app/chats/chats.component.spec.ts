import { db } from 'baqend';

import { ChatsComponent } from './chats.component';

async function flushPromises(times = 3): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

describe('ChatsComponent', () => {
  let component: ChatsComponent;
  let originalMessage: any;
  let originalFile: any;

  beforeEach(() => {
    component = new ChatsComponent();
    originalMessage = (db as any).Message;
    originalFile = (db as any).File;
  });

  afterEach(() => {
    (db as any).Message = originalMessage;
    (db as any).File = originalFile;
  });

  it('loads messages on init', async () => {
    const messages = [{ text: 'Hallo' }];
    const resultList = jasmine.createSpy('resultList').and.returnValue(Promise.resolve(messages));

    (db as any).Message = {
      find: jasmine.createSpy('find').and.returnValue({ resultList })
    };

    component.ngOnInit();
    await flushPromises();

    expect(component.messages).toEqual(messages as any);
  });

  it('builds image URLs from Baqend files', () => {
    (db as any).File = jasmine.createSpy('File').and.returnValue({ url: '/images/user.png' });

    expect(component.getImageUrl({ face: 'faces/user.png' })).toBe('/images/user.png');
    expect((db as any).File).toHaveBeenCalledWith('faces/user.png');
  });
});
