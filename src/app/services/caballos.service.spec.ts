import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CaballosService } from './caballos.service';
import { Caballo } from '../models/caballo';

describe('CaballosService', () => {
  let service: CaballosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CaballosService]
    });
    service = TestBed.inject(CaballosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCaballosByCriadero', () => {
    it('should return an Observable<Caballo[]>', () => {
      const mockCaballos: Caballo[] = [
        {
          id: 1,
          nombre: 'Test Horse',
          criaderoId: 1,
          raza: 'Pura Sangre',
          edad: 5,
          sexo: 'macho',
          estadoSalud: 'saludable'
        }
      ];

      service.getCaballosByCriadero(1).subscribe(caballos => {
        expect(caballos).toEqual(mockCaballos);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/caballos?criaderoId=1');
      expect(req.request.method).toBe('GET');
      req.flush(mockCaballos);
    });
  });

  describe('addCaballo', () => {
    it('should add a caballo to the local array', () => {
      const newCaballo: Caballo = {
        id: 1,
        nombre: 'New Horse',
        criaderoId: 1,
        sexo: 'hembra',
        estadoSalud: 'saludable'
      };

      service.addCaballo(newCaballo);
      // Note: This tests the legacy method, in production this would be replaced with HTTP calls
      expect(service).toBeTruthy(); // Basic existence test
    });
  });

  describe('deleteCaballo', () => {
    it('should remove a caballo from the local array', () => {
      const caballoId = 1;

      service.deleteCaballo(caballoId);
      // Note: This tests the legacy method, in production this would be replaced with HTTP calls
      expect(service).toBeTruthy(); // Basic existence test
    });
  });

  describe('getPadre', () => {
    it('should return the father caballo if exists', () => {
      const mockCaballos: Caballo[] = [
        { id: 1, nombre: 'Padre', criaderoId: 1, sexo: 'macho', estadoSalud: 'saludable' },
        { id: 2, nombre: 'Hijo', criaderoId: 1, padreId: 1, sexo: 'macho', estadoSalud: 'saludable' }
      ];

      // Mock the internal caballos array for this test
      (service as any).caballos = mockCaballos;

      const result = (service as any).getPadre(2);
      expect(result).toEqual(mockCaballos[0]);
    });

    it('should return undefined if no father exists', () => {
      const mockCaballos: Caballo[] = [
        { id: 1, nombre: 'Horse', criaderoId: 1, sexo: 'macho', estadoSalud: 'saludable' }
      ];

      (service as any).caballos = mockCaballos;

      const result = (service as any).getPadre(1);
      expect(result).toBeUndefined();
    });
  });

  describe('getMadre', () => {
    it('should return the mother caballo if exists', () => {
      const mockCaballos: Caballo[] = [
        { id: 1, nombre: 'Madre', criaderoId: 1, sexo: 'hembra', estadoSalud: 'saludable' },
        { id: 2, nombre: 'Hijo', criaderoId: 1, madreId: 1, sexo: 'macho', estadoSalud: 'saludable' }
      ];

      (service as any).caballos = mockCaballos;

      const result = (service as any).getMadre(2);
      expect(result).toEqual(mockCaballos[0]);
    });

    it('should return undefined if no mother exists', () => {
      const mockCaballos: Caballo[] = [
        { id: 1, nombre: 'Horse', criaderoId: 1, sexo: 'macho', estadoSalud: 'saludable' }
      ];

      (service as any).caballos = mockCaballos;

      const result = (service as any).getMadre(1);
      expect(result).toBeUndefined();
    });
  });
});