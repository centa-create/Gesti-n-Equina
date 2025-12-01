import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject, map, catchError, of } from 'rxjs';
import { auth, db } from '../firebase.config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Escuchar cambios de autenticación de Firebase
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        await this.loadUserProfile(user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  private async loadUserProfile(user: User) {
    try {
      // Obtener perfil del usuario desde Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const profile = userDoc.data();

        const userData = {
          id: user.uid,
          email: user.email || '',
          nombre: profile['nombre'] || '',
          apellido: profile['apellido'] || '',
          telefono: profile['telefono'] || '',
          role: profile['roleId'] || 'visitante',
          role_id: this.getRoleId(profile['roleId'])
        };

        this.currentUserSubject.next(userData);
      } else {
        // Usuario sin perfil, crear uno básico
        const userData = {
          id: user.uid,
          email: user.email || '',
          nombre: '',
          apellido: '',
          telefono: '',
          role: 'visitante',
          role_id: 3
        };
        this.currentUserSubject.next(userData);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  }

  private getRoleId(roleName: string): number {
    const roleMap: { [key: string]: number } = {
      'admin': 1,
      'empleado': 2,
      'visitante': 3
    };
    return roleMap[roleName] || 3;
  }

  /**
   * Registrar un nuevo usuario con Firebase Auth
   */
  registrarUsuario(datos: { email: string; password: string; nombre?: string; apellido?: string }): Observable<{ success: boolean; message?: string }> {
    return from(
      createUserWithEmailAndPassword(auth, datos.email, datos.password).then(async (userCredential) => {
        // Crear perfil en Firestore
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          email: datos.email,
          nombre: datos.nombre || '',
          apellido: datos.apellido || '',
          roleId: 'visitante',
          activo: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        return { success: true, message: 'Usuario registrado exitosamente.' };
      })
    ).pipe(
      catchError((error: any) => {
        return of({ success: false, message: error.message || 'Error en el registro' });
      })
    );
  }

  /**
   * Iniciar sesión con Firebase Auth
   */
  login(credentials: { email: string; password: string }): Observable<boolean> {
    return from(
      signInWithEmailAndPassword(auth, credentials.email, credentials.password)
    ).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Login error:', error);
        return of(false);
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): Observable<void> {
    return from(firebaseSignOut(auth)).pipe(
      map(() => void 0),
      catchError(() => of(void 0))
    );
  }

  /**
   * Obtener el rol del usuario actual
   */
  getRole(): string | null {
    const user = this.currentUserSubject.value;
    return user?.role ?? null;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  /**
   * Obtener el email del usuario actual
   */
  getUsername(): string | null {
    const user = this.currentUserSubject.value;
    return user?.email ?? null;
  }

  /**
   * Obtener el usuario actual completo
   */
  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  // Métodos de compatibilidad para mantener la interfaz existente
  loginWithApi(credentials: { email: string; password: string }): Observable<boolean> {
    return this.login(credentials);
  }

  async getAccessToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  refreshAccessToken(): Observable<boolean> {
    return from(
      auth.currentUser?.getIdToken(true) || Promise.resolve(null)
    ).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}