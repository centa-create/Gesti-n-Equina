import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MontadoresService } from '../../services/montadores.service';
import { AuthService } from '../../services/auth.service';
import { Montador } from '../../models/montador';

@Component({
  selector: 'app-montadores',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './montadores.page.html',
  styleUrls: ['./montadores.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MontadoresPage {
  montadores: Montador[] = [];
  nuevoMontador: Partial<Montador> = {};
  userRole: string | null = null;
  canEdit: boolean = false;

  constructor(private montadoresService: MontadoresService, private authService: AuthService) {
    this.userRole = this.authService.getRole();
    this.canEdit = this.userRole === 'admin';
    this.cargarMontadores();
  }

  cargarMontadores() {
    this.montadores = this.montadoresService.getMontadores();
  }

  editarMontador(montador: Montador) {
    if (!this.canEdit) return;
    this.nuevoMontador = { ...montador };
  }

  agregarMontador() {
    if (!this.canEdit) return;

    if (this.nuevoMontador.nombre && this.nuevoMontador.apellido && this.nuevoMontador.especialidad) {
      if (this.nuevoMontador.id) {
        // Update existing
        this.montadoresService.updateMontador(this.nuevoMontador.id, this.nuevoMontador);
      } else {
        // Add new
        this.montadoresService.addMontador(this.nuevoMontador as Omit<Montador, 'id' | 'fechaRegistro'>);
      }
      this.cargarMontadores();
      this.nuevoMontador = {};
    }
  }

  eliminarMontador(id: number) {
    if (!this.canEdit) return;
    this.montadoresService.deleteMontador(id);
    this.cargarMontadores();
  }
}
