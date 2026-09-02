import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-loading-state',
  styleUrl: './loading-state.scss',
  templateUrl: './loading-state.html',
})
export class LoadingState {
  readonly message = input('Carregando...');
}
