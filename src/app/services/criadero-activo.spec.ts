import { TestBed } from '@angular/core/testing';

import { CriaderoActivoService } from './criadero-activo.service';

describe('CriaderoActivoService', () => {
  let service: CriaderoActivoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CriaderoActivoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
