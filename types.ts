
export type UID = string | number;

export enum Sex {
  Male = 'MALE',
  Female = 'FEMALE',
}

export enum AnimalStatus {
  Alive = 'ALIVE',
  Dead = 'DEAD',
  Sold = 'SOLD',
  Deleted = 'DELETED',
}

export enum CalfStatus {
  Alive = 'ALIVE',
  Dead = 'DEAD',
  Sold = 'SOLD',
  Breeding = 'BREEDING', // Recria
  Deleted = 'DELETED',
}

export interface Bull {
  id: UID;
  name: string;
  status: AnimalStatus;
  deathDate?: string;
  saleInfo?: {
    date: string;
    destination: string;
  };
}

export interface Location {
  id: UID;
  name: string;
  assignedBullId: UID;
  isDeleted: boolean;
}

export interface Cow {
  id: UID;
  dib: string; // 4 digits
  birthDate: string;
  locationId: UID;
  status: AnimalStatus;
  deathDate?: string;
  saleInfo?: {
    date: string;
    destination: string;
  };
}

export interface Calf {
  id: UID;
  dib: string; // 4 digits
  sex: Sex;
  motherId: UID;
  fatherId: UID; // Bull, inherited from location
  birthDate: string;
  status: CalfStatus;
  deathDate?: string;
  saleInfo?: {
    date: string;
    destination: string;
  };
  notes?: string;
}

export type Animal = Cow | Calf | Bull;
export type AnimalType = 'Cow' | 'Calf' | 'Bull';

export interface Treatment {
    id: UID;
    animalId: UID;
    animalType: AnimalType;
    treatmentType: string;
    dosage: string;
    dateApplied: string;
    repeatRequired: boolean;
    repeatDate?: string;
    isDeleted: boolean;
}

export type NavSection = 'Boví' | 'Infermeria' | 'Ubicacions' | 'Historial de Vendes' | 'Historial de Morts' | 'Paperera';
