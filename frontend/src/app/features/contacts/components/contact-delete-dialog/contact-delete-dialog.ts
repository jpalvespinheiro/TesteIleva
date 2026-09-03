import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-contact-delete-dialog',
  styleUrl: './contact-delete-dialog.scss',
  templateUrl: './contact-delete-dialog.html',
})
export class ContactDeleteDialog {
  readonly open = input(false);
  readonly contactValue = input.required<string>();
  readonly busy = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
