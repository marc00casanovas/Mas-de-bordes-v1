
import { Bull, Location, Cow, Calf, Sex, CalfStatus, Treatment, AnimalStatus } from '../types';

const today = new Date();
const pastDate = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const futureDate = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const mockBulls: Bull[] = [
  { id: 'bull-1', name: 'Ferdinand', status: AnimalStatus.Alive },
  { id: 'bull-2', name: 'Taurus', status: AnimalStatus.Alive },
];

export const mockLocations: Location[] = [
  { id: 'loc-1', name: 'Paddock A', assignedBullId: 'bull-1', isDeleted: false },
  { id: 'loc-2', name: 'Stable 7', assignedBullId: 'bull-2', isDeleted: false },
  { id: 'loc-3', name: 'West Field', assignedBullId: 'bull-1', isDeleted: false },
];

export const mockCows: Cow[] = [
  { id: 'cow-1', dib: '1111', birthDate: pastDate(1095), locationId: 'loc-1', status: AnimalStatus.Alive },
  { id: 'cow-2', dib: '2222', birthDate: pastDate(1460), locationId: 'loc-2', status: AnimalStatus.Alive },
  { id: 'cow-3', dib: '3333', birthDate: pastDate(730), locationId: 'loc-1', status: AnimalStatus.Alive },
];

export const mockCalves: Calf[] = [
  { id: 'calf-1', dib: '1001', sex: Sex.Female, motherId: 'cow-1', fatherId: 'bull-1', birthDate: pastDate(30), status: CalfStatus.Alive },
  { id: 'calf-2', dib: '1002', sex: Sex.Male, motherId: 'cow-1', fatherId: 'bull-1', birthDate: pastDate(45), status: CalfStatus.Alive },
  { id: 'calf-3', dib: '2001', sex: Sex.Male, motherId: 'cow-2', fatherId: 'bull-2', birthDate: pastDate(90), status: CalfStatus.Alive },
  { id: 'calf-4', dib: '3001', sex: Sex.Female, motherId: 'cow-3', fatherId: 'bull-1', birthDate: pastDate(120), status: CalfStatus.Alive },
  { id: 'calf-5', dib: '3002', sex: Sex.Female, motherId: 'cow-3', fatherId: 'bull-1', birthDate: pastDate(150), status: CalfStatus.Sold, saleInfo: { date: pastDate(20), destination: 'Finca Vecina' } },
  { id: 'calf-6', dib: '2002', sex: Sex.Male, motherId: 'cow-2', fatherId: 'bull-2', birthDate: pastDate(200), status: CalfStatus.Dead, deathDate: pastDate(180) },
];

export const mockTreatments: Treatment[] = [
  { id: 'treat-1', animalId: 'cow-1', animalType: 'Cow', treatmentType: 'Vaccine A', dosage: '10ml', dateApplied: pastDate(10), repeatRequired: true, repeatDate: pastDate(1), isDeleted: false },
  { id: 'treat-2', animalId: 'calf-2', animalType: 'Calf', treatmentType: 'Dewormer', dosage: '5ml', dateApplied: pastDate(15), repeatRequired: true, repeatDate: futureDate(15), isDeleted: false },
  { id: 'treat-3', animalId: 'bull-1', animalType: 'Bull', treatmentType: 'Antibiotic', dosage: '20ml', dateApplied: pastDate(5), repeatRequired: false, isDeleted: false },
  { id: 'treat-4', animalId: 'calf-1', animalType: 'Calf', treatmentType: 'Vaccine B', dosage: '2ml', dateApplied: pastDate(5), repeatRequired: true, repeatDate: today.toISOString().split('T')[0], isDeleted: false },
];
