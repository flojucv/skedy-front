import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MyDateAdapter } from '../../my-date-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ApiService } from '../../services/api.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-edit-event',
  standalone: true,
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    {
      provide: MAT_DATE_FORMATS, useValue: {
        parse: {
          dateInput: 'DD/MM/YYYY',
        },
        display: {
          dateInput: 'DD/MM/YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'DD/MM/YYYY',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      }
    }
  ],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSelectModule
  ],
  templateUrl: './add-edit-event.component.html',
  styleUrl: './add-edit-event.component.less'
})
export class AddEditEventComponent {
  public mode: 'add' | 'edit' = 'add';
  public eventForm: any;
  public chipsGroupsDisplay: any[] = []
  public error: string = '';

  constructor(
    private dialogRef: MatDialogRef<AddEditEventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private api: ApiService
  ) {
    this.eventForm = this.formBuilder.group({
      id: ['0'],
      title: ['', Validators.required],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      group: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    console.log(this.data.event)
    if (!this.data.event) {
      this.mode = 'add';

      if(this.data.start && this.data.end) {
        const startDate = new Date(this.data.start);
        const endDate = new Date(this.data.end);

        this.eventForm.patchValue({
          startDate: startDate,
          startTime: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
          endDate: endDate,
          endTime: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
        });
      }
    } else {
      this.mode = 'edit';

      const dateStart = new Date(this.data.event.start);
      const dateEnd = new Date(this.data.event.end);

      const startDate = `${dateStart.getDate().toString().padStart(2, '0')}/${(dateStart.getMonth() + 1).toString().padStart(2, '0')}/${dateStart.getFullYear()}`;
      const startTime = `${dateStart.getHours().toString().padStart(2, '0')}:${dateStart.getMinutes().toString().padStart(2, '0')}`;
      const endDate = `${dateEnd.getDate().toString().padStart(2, '0')}/${(dateEnd.getMonth() + 1).toString().padStart(2, '0')}/${dateEnd.getFullYear()}`;
      const endTime = `${dateEnd.getHours().toString().padStart(2, '0')}:${dateEnd.getMinutes().toString().padStart(2, '0')}`;

      console.log(`${dateStart.getDate().toString().padStart(2, '0')}/${(dateStart.getMonth() + 1).toString().padStart(2, '0')}/${dateStart.getFullYear()}`)

      this.eventForm.patchValue({
        id: this.data.event.id,
        title: this.data.event.title,
        startDate: dateStart,
        startTime: startTime,
        endDate: (this.data.event.end) ? dateEnd : dateStart,
        endTime: (this.data.event.end) ? endTime : startTime,
        group: this.data.event.group
      });
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    console.log(this.eventForm.invalid);
    if (this.eventForm.invalid) { this.error = (this.eventForm.value.group.length < 1) ? 'Vous devez renseignez au moins un groupe' : 'Veuillez remplir tous les champs requis'; return };
    (this.mode == 'add') ? this.addEvent() : this.editEvent();
  }

  addEvent() {
    const startDate = this.eventForm.value.startDate;
    startDate.setHours(this.eventForm.value.startTime.split(':')[0]);
    startDate.setMinutes(this.eventForm.value.startTime.split(':')[1]);
    const endDate = this.eventForm.value.endDate;
    endDate.setHours(this.eventForm.value.endTime.split(':')[0]);
    endDate.setMinutes(this.eventForm.value.endTime.split(':')[1]);
    const data = {
      title: this.eventForm.value.title,
      start: startDate,
      end: endDate,
      group_id: this.eventForm.value.group
    }

    this.api.setEvent(data).subscribe({
      next: (res: any) => {
        if (res.error) {
          this.error = res.messages.fr;
          return;
        } else {
          this.dialogRef.close({ reload: true });
        }
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Une erreur est survenue lors de l\'ajout de l\'événement';
      }
    })
  }

  editEvent() {
    const startDate: Date = new Date(this.eventForm.value.startDate); // Toujours cloner pour éviter les effets de bord
    const [startHour, startMinute] = this.eventForm.value.startTime.split(':').map(Number);
    startDate.setHours(startHour + 2, startMinute, 0, 0); // Ajoute 2 heures, minutes, secondes, ms

    const endDate: Date = new Date(this.eventForm.value.endDate);
    const [endHour, endMinute] = this.eventForm.value.endTime.split(':').map(Number);
    endDate.setHours(endHour + 2, endMinute, 0, 0);

    const data = {
      title: this.eventForm.value.title,
      start: startDate,
      end: endDate,
      group_id: this.eventForm.value.group
    };


    this.api.updateEvent(data, this.eventForm.value.id).subscribe({
      next: (res: any) => {
        if (res.error) {
          this.error = res.messages.fr;
          return;
        } else {
          this.dialogRef.close({ reload: true });
        }
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Une erreur est survenue lors de la modification de l\'événement';
      }
    })
  }
}
