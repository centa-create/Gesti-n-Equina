import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, RouterModule]
})
export class RegistroPage {
  registroForm: any;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', []],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]]
    });
  }

  registrar() {
    const datos = this.registroForm.value;

    // Verificar que las contraseñas coincidan
    if (datos.password !== datos.confirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.registroForm.valid) {
      const payload = {
        email: datos.email || '',
        password: datos.password || '',
        nombre: datos.nombre || undefined,
        apellido: datos.apellido || undefined
      };

      this.authService.registrarUsuario(payload).subscribe({
        next: (result) => {
          if (result.success) {
            alert(result.message || 'Registro exitoso.');
            this.router.navigate(['/login']);
          } else {
            // Manejar errores específicos
            if (result.message && result.message.includes('already registered')) {
              alert('Este correo ya está registrado. Intenta iniciar sesión.');
              this.router.navigate(['/login']);
            } else {
              alert('Error en el registro: ' + (result.message || 'Inténtalo de nuevo.'));
            }
          }
        },
        error: (err) => {
          alert('Error de conexión: ' + err.message);
        }
      });
    } else {
      // Mostrar errores específicos
      const errors = [];
      if (this.registroForm.get('nombre')?.invalid) errors.push('Nombre requerido (mín 3 caracteres)');
      if (this.registroForm.get('email')?.invalid) errors.push('Email inválido');
      if (this.registroForm.get('password')?.invalid) errors.push('Contraseña requerida (mín 6 caracteres)');
      if (this.registroForm.get('confirmar')?.invalid) errors.push('Confirmar contraseña requerido');
      alert('Errores:\n' + errors.join('\n'));
    }
  }
}