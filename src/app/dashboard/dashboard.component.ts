import { MatMenuModule } from '@angular/material/menu';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { ApiService } from '../services/api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddUserComponent } from '../Modal/add-user/add-user.component';
import { ConfirmDeleteUserComponent } from '../Modal/confirm-delete-user/confirm-delete-user.component';
import { AddRoleComponent } from '../Modal/add-role/add-role.component';
import { ConfirmDeleteRoleComponent } from '../Modal/confirm-delete-role/confirm-delete-role.component';
import { AddGroupeComponent } from '../Modal/add-groupe/add-groupe.component';
import { ConfirmDeleteGroupComponent } from '../Modal/confirm-delete-group/confirm-delete-group.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatMenuModule,
    MatIconModule,
    RouterLink,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.less'
})
export class DashboardComponent {
  isAdminValue: boolean = false;

  public users: any[] = [];
  public displayUsers: any[] = [];
  public displayedUsersColumns: string[] = ['id', 'username', 'role', 'group', 'actions'];
  public roles: any[] = [];
  public displayRoles: any[] = [];
  public displayedRolesColumns: string[] = ['id', 'name', 'permissions', 'actions'];
  public groups: any[] = [];
  public displayGroups: any[] = [];
  public displayedGroupsColumns: string[] = ['id', 'name', 'color', 'actions'];
  public chipsGroupsDisplay: any[] = [];

  public userEditable: string = '';
  private initialUserData: any;

  constructor(
    private AuthService: AuthService,
    private api: ApiService,
    private modal: MatDialog
  ) { }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.AuthService.hasPermission("admin").subscribe({
      next: (hasPermission: any) => {
        this.isAdminValue = hasPermission;
      },
      error: () => {
        this.isAdminValue = false;
      }
    });

    this.api.getUsers().subscribe({
      next: (res: any) => {
        console.log('Users:', res);
        this.users = res.data;
        this.displayUsers = this.users;
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
      }
    });

    this.api.getRoles().subscribe({
      next: (res: any) => {
        console.log('Roles:', res);
        this.roles = res.data;
        this.displayRoles = this.roles;
      },
      error: (error: any) => {
        console.error('Error fetching roles:', error);
      }
    });

    this.api.getGroups().subscribe({
      next: (res: any) => {
        console.log('Groups:', res);
        this.groups = res.data;
        this.displayGroups = this.groups;
        this.chipsGroupsDisplay = this.groups;
      },
      error: (error: any) => {
        console.error('Error fetching groups:', error);
      }
    });
  }

  isAdmin(): boolean {
    return this.isAdminValue;
  }

  applyUsersFilter(value: any) {
    value = value.target.value.trim().toLowerCase();
    this.displayUsers = this.users.filter(user => {
      return user.username.toLowerCase().includes(value) || user.role_label.toLowerCase().includes(value);
    });
  }

  applyRoleFilter(value: any) {
    value = value.target.value.trim().toLowerCase();
    this.displayRoles = this.roles.filter(role => {
      return role.label.toLowerCase().includes(value);
    });
  }

  editUser(user: any) {
    this.initialUserData = JSON.parse(JSON.stringify(user));
    this.userEditable = user.id;
    this.chipsGroupsDisplay = this.groups.filter(group => !user.groups.some((g: any) => g.id == group.id));
  }

  addUserGroup(event: any, user: any, input: any) {
    user.groups.push(event.option.value);
    this.chipsGroupsDisplay = this.groups.filter(group => !user.groups.some((g: any) => g.id == group.id));
    input.value = '';
  }

  removeUserGroup(group: any, user: any) {
    const index = user.groups.indexOf(group);
    if (index >= 0) {
      user.groups.splice(index, 1);
    }
    this.chipsGroupsDisplay = this.groups.filter(g => !user.groups.some((ug: any) => ug.id == g.id));
  }

  saveEditUser(user: any) {
    this.api.updateUser(user.id, {
      username: user.username,
      groups: user.groups.map((group: any) => group.id),
      role_id: user.role_id
    }).subscribe({
      next: (res: any) => {
        console.log('User updated successfully:', res);
        this.userEditable = '';
        this.initialUserData = null;
        this.chipsGroupsDisplay = this.groups;
        this.init();
      },
      error: (error: any) => {
        console.error('Error updating user:', error);
      }
    });
  }

  cancelEditUser(user: any) {
    this.userEditable = '';
    user.username = this.initialUserData.username;
    user.groups = this.initialUserData.groups;
    user.role_label = this.initialUserData.role_label;
    user.role_id = this.initialUserData.role_id;
    this.chipsGroupsDisplay = this.groups;
  }

  addUser() {
    const modalActif = this.modal.open(AddUserComponent, {
      width: '500px',
      data: {
        roles: this.roles,
        groups: this.groups
      }
    });

    modalActif.afterClosed().subscribe({
      next: (result: any) => {
        console.log(result);
        if (result && result.success) {
          this.api.getUsers().subscribe({
            next: (res: any) => {
              this.users = res.data;
              this.displayUsers = this.users;
            },
            error: (error: any) => {
              console.error('Error fetching users:', error);
            }
          });
        }
      },
      error: (error: any) => {
        console.error('Error closing modal:', error);
      }
    });
  }
  
  addRole() {
    const modalActif = this.modal.open(AddRoleComponent, {
      width: '500px',
    });

    modalActif.afterClosed().subscribe({
      next: (result: any) => {
        if (result && !result.error) {
          this.api.getRoles().subscribe({
            next: (res: any) => {
              this.roles = res.data;
              this.displayRoles = this.roles;
            },
            error: (error: any) => {
              console.error('Error fetching roles:', error);
            }
          });
        }
      },
      error: (error: any) => {
        console.error('Error closing modal:', error);
      }
    });
  }

  editRole(role: any) {}

  deleteRole(role: any) {
    const modalActif = this.modal.open(ConfirmDeleteRoleComponent, {
      width: '400px',
      data: {
        role: role
      }
    });

    modalActif.afterClosed().subscribe({
      next: (result: any) => {
        if (result) {
          this.init();
        }
      },
      error: (error: any) => {
        console.error('Error closing delete confirmation modal:', error);
      }
    });
  }

  deleteUser(user: any) {
    const modalActif = this.modal.open(ConfirmDeleteUserComponent, {
      width: '400px',
      data: {
        user: user
      }
    });

    modalActif.afterClosed().subscribe({
      next: (result: any) => {
        if (result) {
          this.init();
        }
      },
      error: (error: any) => {
        console.error('Error closing delete confirmation modal:', error);
      }
    });
  }

  addGroup() {
    const modalActif = this.modal.open(AddGroupeComponent, {
      width: '500px',
    });

    modalActif.afterClosed().subscribe({
      next: (result: any) => {
        if (result && !result.error) {
          this.api.getGroups().subscribe({
            next: (res: any) => {
              this.groups = res.data;
              this.displayGroups = this.groups;
              this.chipsGroupsDisplay = this.groups;
            },
            error: (error: any) => {
              console.error('Error fetching groups:', error);
            }
          });
        }
      },
      error: (error: any) => {
        console.error('Error closing modal:', error);
      }
    });
  }

  applyGroupsFilter(value: any) {
    value = value.target.value.trim().toLowerCase();
    this.displayGroups = this.groups.filter(group => {
      return group.label.toLowerCase().includes(value) || group.color.toLowerCase().includes(value);
    });
  }

  deleteGroup(group: any) {
    const modalActif = this.modal.open(ConfirmDeleteGroupComponent, {
      width: '400px',
      data: {
        group: group
      }
    });

    modalActif.afterClosed().subscribe({
      next: (result: any) => {
        if (result) {
          this.init();
        }
      },
      error: (error: any) => {
        console.error('Error closing delete confirmation modal:', error);
      }
    });
  }
}
