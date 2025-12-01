import { TestBed } from '@angular/core/testing';

import { CaballosService } from './caballos.service';

describe('CaballosService', () => {
  let service: CaballosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaballosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
