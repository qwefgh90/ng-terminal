import { TestBed } from '@angular/core/testing';

import { LinearRenderService } from './linear-render.service';
import { ElementRef } from '@angular/core';

describe('LinearRenderService', () => {
  let service: LinearRenderService;
  const spy = jasmine.createSpyObj('ElementRef', [''], ['nativeElement']);

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [{provide: ElementRef, useValue: spy}]});
    service = TestBed.inject(LinearRenderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
