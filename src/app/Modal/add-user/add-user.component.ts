import { Component, Inject } from '@angular/core';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../services/api.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.less'
})
export class AddUserComponent {
  public formAddUser: any;
  public roles: any[] = [];
  public groups: any[] = [];
  public chipsGroupsDisplay: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddUserComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService
  ) {
    this.formAddUser = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role_id: ['', Validators.required],
      groups: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.roles = this.data.roles || [];
    this.groups = this.data.groups || [];
    this.chipsGroupsDisplay = this.groups;
  }

  reloadGroupsDisplay() {
    this.chipsGroupsDisplay = this.groups.filter(group => !this.formAddUser.get('groups').value.some((g: any) => g.id == group.id));
  }

  removeUserGroup(group: any) {
    const groupsArray = this.formAddUser.get('groups');
    if (groupsArray) {
      const index = groupsArray.value.indexOf(group);
      if (index >= 0) {
        groupsArray.removeAt(index);
      }
    }

    this.reloadGroupsDisplay();
  }

  addUserGroup(group: any, input: any) {
    const groupsArray = this.formAddUser.get('groups');
    if (groupsArray && !groupsArray.value.includes(group.option.value)) {
      groupsArray.push(this.formBuilder.control(group.option.value));
    }

    input.value = '';
    this.reloadGroupsDisplay();
  }

  onSubmit() {
    if (this.formAddUser.valid) {
      const userData = {
        username: this.formAddUser.get('username').value,
        password: this.formAddUser.get('password').value,
        role_id: this.formAddUser.get('role_id').value,
        groups: this.formAddUser.get('groups').value.map((group: any) => group.id)
      };

      this.api.addUser(userData).subscribe({
        next: (res: any) => {
          console.log('User added successfully:', res);
          this.dialogRef.close({ success: true });
        },
        error: (error: any) => {
          console.error('Error adding user:', error);
          this.dialogRef.close({ success: false, error: error });
        }
      });
    } else {
      console.error('Form is invalid');
    }
  }

  onNoClick(): void {
    this.dialogRef.close({ success: false });
  }
}
