import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loginWithApi', () => {
    it('should login successfully and store user data', () => {
      const credentials = { username: 'admin', password: '1234' };
      const mockResponse = {
        accessToken: 'mock-jwt-token',
        user: { username: 'admin', role: 'admin' }
      };

      service.loginWithApi(credentials).subscribe(result => {
        expect(result).toBe(true);
        expect(service.getUsername()).toBe('admin');
        expect(service.getRole()).toBe('admin');
        expect(service.isAuthenticated()).toBe(true);
        // currentUser is kept in-memory; no localStorage assertions
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should handle login failure', () => {
      const credentials = { username: 'admin', password: 'wrong' };

      service.loginWithApi(credentials).subscribe(result => {
        expect(result).toBe(false);
        expect(service.isAuthenticated()).toBe(false);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(null, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('login (fallback)', () => {
    it('should login with valid credentials', () => {
      const result = service.login('admin', '1234');
      expect(result).toBe(true);
      expect(service.getUsername()).toBe('admin');
      expect(service.getRole()).toBe('admin');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should reject invalid credentials', () => {
      const result = service.login('admin', 'wrong');
      expect(result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user data and localStorage', () => {
      // First login
      service.login('admin', '1234');
      expect(service.isAuthenticated()).toBe(true);

      // Then logout
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getUsername()).toBe(null);
      expect(service.getRole()).toBe(null);
    });
  });

  describe('getAccessToken', () => {
    it('should return access token after loginWithApi', () => {
      const mockResponse = {
        accessToken: 'mock-jwt-token',
        user: { username: 'admin', role: 'admin' }
      };

      service.loginWithApi({ username: 'admin', password: '1234' }).subscribe(() => {
        expect(service.getAccessToken()).toBe('mock-jwt-token');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
      req.flush(mockResponse);
    });

    it('should return null for fallback login', () => {
      service.login('admin', '1234');
      expect(service.getAccessToken()).toBe(null);
    });
  });

  // localStorage persistence tests removed: AuthService now keeps session in memory and uses refresh cookie.
});