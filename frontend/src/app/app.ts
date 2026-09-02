import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from './layout/app-header/app-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppHeader, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
