import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { departmentGuard } from './department.guard';

describe('departmentGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => departmentGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
