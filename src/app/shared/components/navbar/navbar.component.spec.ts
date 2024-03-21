import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { expect, jest, test } from '@jest/globals';
import { signal } from '@angular/core';
import { Auth } from '@shared/services/mock-backend.service';
import { AuthService } from '../../../shared/services/auth.service';

const validAuth: Auth = {
  email: 'test@test.com',
  token: 'asiwjLENAbehAEIAH72JAh',
  valid: true,
  loading: false,
};

let authServiceMock = {
  authState: jest.fn(() => signal(validAuth)),
};

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Nav isn't routed, so keeping this test here for now until user functionality is implemented and can be tested
  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
