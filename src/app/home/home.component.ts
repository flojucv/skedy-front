import { AuthService } from './../services/auth.service';
import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { AddEditEventComponent } from '../Modal/add-edit-event/add-edit-event.component';
import { CalendarTemplateEventComponent } from '../calendar-template-event/calendar-template-event.component';
import { Title } from '@angular/platform-browser';
import { HeaderComponent } from "../header/header.component";
import { NotificationsService } from '../services/notifications.service';
import { ExportModalComponent } from '../Modal/export-modal/export-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    FullCalendarModule,
    MatProgressSpinnerModule,
    HeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent implements OnInit, OnDestroy {
  title = 'Skedy・Calendrier';
  isAdminValue: boolean = false;
  isWritePermission: boolean = false;
  isLoading: boolean = true;
  private userInfo: any = null;
  public plugins = [
    dayGridPlugin,
    interactionPlugin,
    listPlugin,
    multiMonthPlugin,
    timeGridPlugin,
  ];
  private clickTimeout: any = null;
  private resizeListener: (() => void) | undefined;

  public calendarOptions: CalendarOptions = {
    initialView: this.getInitialView(),
    allDaySlot: false,
    dayHeaderFormat: { weekday: 'long' },
    views: {
      multiMonthYear: {
        dayHeaderFormat: { weekday: 'short' },
      },
      dayGridWeek: {
        dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'short' },
      },
      dayGridDay: {
        titleFormat: {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
        dayHeaderFormat: {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
      },
      timeGridWeek: {
        allDaySlot: true,
        dayMaxEvents: false,
        eventMaxStack: 3
      },
      timeGridDay: {
        allDaySlot: true,
        dayMaxEvents: false
      }
    },
    eventContent: this.renderEventContent.bind(this),
    multiMonthMaxColumns: 2,
    multiMonthMinWidth: 350,
    firstDay: 1,
    locale: frLocale,
    plugins: this.plugins,
    weekNumbers: true,
    eventClick: this.editEvent.bind(this),
    weekText: 'S',
    headerToolbar: this.getHeaderToolbar(),
    height: 'auto', // Important pour le responsive
    aspectRatio: this.getAspectRatio(), // Ratio adaptatif
    windowResize: () => {
      this.handleWindowResize();
    },
    dateClick: (info) => {
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
        this.handleDateDoubleClick(info);
      } else {
        this.clickTimeout = setTimeout(() => {
          this.clickTimeout = null;
        }, 300);
      }
    },
    datesSet: this.changeDate.bind(this),
  };

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  constructor(
    private AuthService: AuthService,
    private api: ApiService,
    private modal: MatDialog,
    private cdr: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private titleService: Title,
    private notification: NotificationsService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.AuthService.hasPermission("admin").subscribe({
      next: (hasPermission: any) => {
        this.isAdminValue = hasPermission;
      },
      error: () => {
        this.isAdminValue = false;
      }
    });

    this.AuthService.hasPermission("write").subscribe({
      next: (hasPermission: any) => {
        this.isWritePermission = hasPermission;
      },
      error: () => {
        this.isWritePermission = false;
      }
    })

    this.api.getUserInfo().subscribe({
      next: (res: any) => {
        this.userInfo = res.data;
        console.log('User Info:', this.userInfo);
      },
      error: (err: any) => {
        console.error('Error fetching user info:', err);
      }
    })

    // Écouter les changements de taille d'écran
    this.resizeListener = () => this.handleWindowResize();
    window.addEventListener('resize', this.resizeListener);

    this.isLoading = false;
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  loadCalendarEvents(start: string, end: string): void {
    console.log('Loading calendar events from:', start, 'to:', end);
    this.api.getCalendarEvents(start, end).subscribe({
      next: (res: any) => {
        if (this.calendarComponent) {
          console.log('Loading calendar events:', res);
          this.calendarComponent.getApi().removeAllEvents();
          this.calendarComponent.getApi().addEventSource(this.processEvents(res.data));
          console.log(this.calendarComponent.getApi().getEvents())

          this.api.getPublicHolidays(new Date(start).getFullYear()).subscribe({
            next: (holidays: any) => {
              Object.keys(holidays).forEach((key: any) => {
                this.calendarComponent.getApi().addEvent({
                  title: holidays[key],
                  start: key,
                  allDay: true,
                  classNames: ['holiday-event'],
                  extendedProps: {
                    group_id: 'holidays'
                  }
                });
              });
            }
          })
        }
      },
      error: (err: any) => {
        console.error('Error loading calendar events:', err);
      }
    });
  }

  isAdmin(): boolean {
    return this.isAdminValue;
  }

  public editEvent(data: any): void {
    if (!this.isWritePermission && !this.isAdminValue) {
      console.warn('User does not have permission to edit events.');
      return;
    }
    const eventData: any = {
      id: data.event._def.publicId,
      title: data.event.title,
      start: data.event.start,
      end: data.event.end,
      group: data.event.extendedProps.group_id,
    };
    const modal = this.modal.open(AddEditEventComponent, {
      width: this.getModalWidth(),
      data: { user: this.userInfo, event: eventData }
    })

    modal.afterClosed().subscribe((result: any) => {
      if (result && result.reload) {
        // Récupérer les dates de début et fin de la vue actuelle
        const calendarApi = this.calendarComponent.getApi();
        const view = calendarApi.view;

        // Dates de début et fin de la période affichée
        const startDate = view.activeStart.toISOString();
        const endDate = view.activeEnd.toISOString();

        this.loadCalendarEvents(startDate, endDate);
        this.notification.pushNotification('Événement modifié avec succès', 'Success');
      }
    });
  }

  private handleDateDoubleClick(info: any) {
    if (!this.isWritePermission && !this.isAdminValue) {
      console.warn('User does not have permission to add events.');
      return;
    }

    const date = new Date();
    const startDate = info.date;
    startDate.setHours(date.getHours(), date.getMinutes(), 0, 0); // Mettre à l'heure actuelle
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1); // Par défaut, ajoute 1 heure

    const modal = this.modal.open(AddEditEventComponent, {
      width: this.getModalWidth(),
      data: { user: this.userInfo, start: startDate, end: endDate }
    });

    modal.afterClosed().subscribe((result: any) => {
      if (result && result.reload) {
        // Récupérer les dates de début et fin de la vue actuelle
        const calendarApi = this.calendarComponent.getApi();
        const view = calendarApi.view;

        // Dates de début et fin de la période affichée
        const startDate = view.activeStart.toISOString();
        const endDate = view.activeEnd.toISOString();

        this.loadCalendarEvents(startDate, endDate);
        this.notification.pushNotification('Événement ajouté avec succès', 'Success');
      }
    });
  }

  private changeDate(arg: any) {
    this.loadCalendarEvents(arg.startStr, arg.endStr);
  }

  public showAddCourseModal(): void {
    const modal = this.modal.open(AddEditEventComponent, {
      width: this.getModalWidth(),
      data: { user: this.userInfo }
    })

    modal.afterClosed().subscribe((result: any) => {
      if (result && result.reload) {
        // Récupérer les dates de début et fin de la vue actuelle
        const calendarApi = this.calendarComponent.getApi();
        const view = calendarApi.view;

        // Dates de début et fin de la période affichée
        const startDate = view.activeStart.toISOString();
        const endDate = view.activeEnd.toISOString();

        this.loadCalendarEvents(startDate, endDate);
        this.notification.pushNotification('Événement ajouté avec succès', 'Success');
      }
    });
  }

  private getInitialView(): string {
    const width = window.innerWidth;
    if (width < 576) {
      return 'listWeek'; // Très petit écran
    } else if (width < 768) {
      return 'listWeek'; // Mobile
    } else if (width < 1024) {
      return 'timeGridWeek'; // Tablette
    } else if (width < 1440) {
      return 'dayGridMonth'; // Desktop normal
    }
    return 'dayGridMonth'; // Grand écran
  }

  private getHeaderToolbar(): any {
    const width = window.innerWidth;
    console.log('Current window width:', width);
    if (width < 576) {
      // Très petit écran (< 576px)
      return {
        left: 'prev,next',
        center: '',
        right: 'today'
      };
    } else if (width < 768) {
      // Mobile (576px - 768px)
      return {
        left: 'prev,next',
        center: 'title',
        right: 'today'
      };
    } else if (width < 1024) {
      // Tablette (768px - 1024px)
      return {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek'
      };
    }

    // Desktop (> 1024px)
    return {
      left: 'prev,next today',
      center: 'title',
      right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    };
  }

  private getAspectRatio(): number {
    const width = window.innerWidth;
    if (width < 768) {
      return 1.0; // Plus carré sur mobile
    } else if (width < 1024) {
      return 1.35; // Ratio moyen sur tablette
    }
    return 1.6; // Ratio large sur desktop
  }

  private getModalWidth(): string {
    const width = window.innerWidth;
    if (width < 768) {
      return '95vw'; // Quasi plein écran sur mobile
    } else if (width < 1024) {
      return '80vw'; // Large sur tablette
    }
    return '600px'; // Taille fixe sur desktop
  }

  private handleWindowResize(): void {
    // Debounce pour éviter trop d'appels
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      const newView = this.getInitialView();
      const newToolbar = this.getHeaderToolbar();
      const newAspectRatio = this.getAspectRatio();

      // Mettre à jour les options du calendrier
      this.calendarOptions = {
        ...this.calendarOptions,
        initialView: newView,
        headerToolbar: newToolbar,
        aspectRatio: newAspectRatio
      };

      // Forcer la détection des changements
      this.cdr.detectChanges();

      // Si le calendrier est déjà initialisé, changer la vue
      if (this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.changeView(newView);
        calendarApi.render();
      }
    }, 250);
  }

  private resizeTimeout: any;

  private renderEventContent(arg: any) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      CalendarTemplateEventComponent
    );
    const component = factory.create(this.injector);
    component.instance.event = arg.event;
    component.instance.arg = arg;
    component.changeDetectorRef.detectChanges();
    return { domNodes: [component.location.nativeElement] };
  }

  // Fonction pour traiter les événements
  private processEvents(events: any[]) {
    return events.map(event => {
      const processedEvent = { ...event };

      // Vérifier si start et end existent
      if (event.start && event.end) {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);

        console.log(`${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}` != `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`)

        processedEvent.allDay = false;

        if (`${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}` != `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`) {
          processedEvent.allDay = true;
        }
      }

      console.log('Processed Event:', processedEvent);
      return processedEvent;
    });
  }

  // Ajoutez cette méthode dans votre classe HomeComponent
  public showExportModal(): void {
    // Récupérer tous les événements du calendrier
    this.api.getExportEvents().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          console.log(res)
          // Filtrer les événements (optionnel - exclure les jours fériés par exemple)
          const filteredEvents = res.data.filter((event:any) =>
            event.extendedProps?.['group_id'] !== 'holidays'
          );

          // Convertir les événements en format compatible
          const exportEvents = filteredEvents.map((event:any) => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            extendedProps: event.extendedProps
          }));

          // Ouvrir la modal d'export
          const modal = this.modal.open(ExportModalComponent, {
            width: this.getModalWidth(),
            data: { events: exportEvents }
          });

          modal.afterClosed().subscribe((result: any) => {
            if (result) {
              this.notification.pushNotification('Export terminé avec succès', 'Success');
            }
          });
        }
      }
    });
  }
}