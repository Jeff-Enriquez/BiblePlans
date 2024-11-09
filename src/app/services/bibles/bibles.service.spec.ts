import { TestBed } from '@angular/core/testing';

import { BiblesService } from './bibles.service';

describe('BiblesService', () => {
  let service: BiblesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BiblesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
