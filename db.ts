
import Dexie, { Table } from 'dexie';
import { Cow, Calf, Bull, Location, Treatment, UID } from './types';

export class AppDatabase extends Dexie {
  cows!: Table<Cow, UID>;
  calves!: Table<Calf, UID>;
  bulls!: Table<Bull, UID>;
  locations!: Table<Location, UID>;
  treatments!: Table<Treatment, UID>;

  constructor() {
    super('gestioRamaderaDB');
    // FIX: Cast 'this' to Dexie to resolve a TypeScript error where the 'version' method was not found.
    (this as Dexie).version(1).stores({
      cows: '++id, dib, locationId, status',
      calves: '++id, dib, motherId, fatherId, status, birthDate',
      bulls: '++id, name, status',
      locations: '++id, name, isDeleted',
      treatments: '++id, animalId, animalType, dateApplied, repeatDate',
    });
  }
}

export const db = new AppDatabase();
