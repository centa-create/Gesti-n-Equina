import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './unauthorized.page.html',
  styleUrls: ['./unauthorized.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnauthorizedPage {}