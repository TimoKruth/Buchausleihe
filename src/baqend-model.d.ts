import {binding, GeoPoint} from 'baqend';

declare module 'baqend' {

  interface baqend {
    Message: binding.EntityFactory<model.Message>;
  }

  namespace model {
    interface Device extends binding.Entity {
      deviceOs: string;
    }

    interface Role extends binding.Entity {
      name: string;
      users: Set<User>;
    }

    interface User extends binding.Entity {
      username: string;
      inactive: boolean;
    }

    interface Book extends binding.Entity{
      Nummer: number;
      Name: string;
      Autor: string;
      Anzahl: number;
      Verliehen: boolean;
      Vorgemerkt: boolean;
      vorgemerktFuer: string;
      Kategorie: Buchreihe;
    }

    interface Buchreihe extends binding.Entity{
      id: string;
      name: string;
      Lesestufe: number;
      Zusatzinfo: string;
      Untertitel: string;
    }

    interface Ausleihen extends binding.Entity{
      Schueler: string;
      Buch: Book;
      Zeitpunkt: Date;
    }

    interface Message extends binding.Entity {
      name: string;
      text: string;
      face: string;
    }

  }
}
