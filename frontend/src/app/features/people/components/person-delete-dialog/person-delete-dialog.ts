import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-person-delete-dialog',
  styleUrl: './person-delete-dialog.scss',
  templateUrl: './person-delete-dialog.html',
})
export class PersonDeleteDialog {
  readonly open = input(false);
  readonly personName = input.required<string>();
  readonly busy = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
