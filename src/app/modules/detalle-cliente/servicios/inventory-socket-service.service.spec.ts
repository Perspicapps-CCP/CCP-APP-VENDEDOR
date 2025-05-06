import { TestBed } from '@angular/core/testing';

import { InventorySocketServiceService } from './inventory-socket-service.service';

describe('InventorySocketServiceService', () => {
  let service: InventorySocketServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventorySocketServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
