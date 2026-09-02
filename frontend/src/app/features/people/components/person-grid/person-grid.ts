import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Person } from '../../../../core/models/person.model';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { PhonePipe } from '../../../../shared/pipes/phone-pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CpfPipe, PhonePipe, RouterLink],
  selector: 'app-person-grid',
  styleUrl: './person-grid.scss',
  templateUrl: './person-grid.html',
})
export class PersonGrid {
  readonly people = input.required<readonly Person[]>();
  readonly deleteRequested = output<Person>();
}
