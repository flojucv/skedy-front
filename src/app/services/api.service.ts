import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public header_v2: HttpHeaders = new HttpHeaders();

  public initializeHeader_v2(): void {
    if (this.cookieService.check('authToken')) {
      const token = this.cookieService.get('authToken');
      this.header_v2 = new HttpHeaders({
        Authorization: 'Bearer ' + token,
      });
    }
  }

  constructor(
    private cookieService: CookieService,
    private http: HttpClient
  ) { }

  login(username: string, password: string) {
    const body = {
      username,
      password
    }

    return this.http.post<any>(`${environment.API_URL}/login`, body);
  }

  hasPermission(permission: string) {
    this.initializeHeader_v2();
    return this.http.get<any>(`${environment.API_URL}/permissions/${permission}`, {
      headers: this.header_v2
    });
  }

  getUsers() {
    this.initializeHeader_v2();
    return this.http.get<any>(`${environment.API_URL}/users`, {
      headers: this.header_v2
    });
  }

  getRoles() {
    this.initializeHeader_v2();
    return this.http.get<any>(`${environment.API_URL}/roles`, {
      headers: this.header_v2
    });
  }

  getGroups() {
    this.initializeHeader_v2();
    return this.http.get<any>(`${environment.API_URL}/groups`, {
      headers: this.header_v2
    });
  }

  updateUser(userId: string, data:any) {
    this.initializeHeader_v2();
    return this.http.put<any>(`${environment.API_URL}/user/${userId}`, data, {
      headers: this.header_v2
    });
  }

  addUser(data: any) {
    this.initializeHeader_v2();
    return this.http.post<any>(`${environment.API_URL}/register`, data, {
      headers: this.header_v2
    });
  }

  deleteUser(userId: string) {
    console.log('Deleting user with ID:', userId);
    this.initializeHeader_v2();
    return this.http.delete<any>(`${environment.API_URL}/user/${userId}`, {
      headers: this.header_v2
    });
  }

  addRole(data: any) {
    this.initializeHeader_v2();
    return this.http.post<any>(`${environment.API_URL}/role`, data, {
      headers: this.header_v2
    });
  }

  deleteRole(roleId: string) {
    console.log('Deleting role with ID:', roleId);
    this.initializeHeader_v2();
    return this.http.delete<any>(`${environment.API_URL}/role/${roleId}`, {
      headers: this.header_v2
    });
  }

  addGroup(data: any) {
    this.initializeHeader_v2();
    return this.http.post<any>(`${environment.API_URL}/group`, data, {
      headers: this.header_v2
    });
  }

  deleteGroup(groupId: string) {
    this.initializeHeader_v2();
    return this.http.delete<any>(`${environment.API_URL}/group/${groupId}`, {
      headers: this.header_v2
    });
  }

  getCalendarEvents(start:string, end:string) {
    this.initializeHeader_v2();
    return this.http.get<any>(`${environment.API_URL}/calendar/events?start=${start}&end=${end}`, {
      headers: this.header_v2
    });
  }

  getUserInfo() {
    this.initializeHeader_v2();
    return this.http.get<any>(`${environment.API_URL}/user`, {
      headers: this.header_v2
    });
  }

  setEvent(data: any) {
    this.initializeHeader_v2();
    return this.http.post<any>(`${environment.API_URL}/calendar/event`, data, {
      headers: this.header_v2
    });
  }

  updateEvent(data: any, eventId:string) {
    this.initializeHeader_v2();
    return this.http.put<any>(`${environment.API_URL}/calendar/event/${eventId}`, data, {
      headers: this.header_v2
    });
  }

  getPublicHolidays(year: number) {
    return this.http.get<any>(`https://calendrier.api.gouv.fr/jours-feries/metropole/${year}.json`);
  }

  getExportEvents() {
    this.initializeHeader_v2();
    return this.http.get<any>(`${environment.API_URL}/calendar/export`, {
      headers: this.header_v2
    });
  }
}
