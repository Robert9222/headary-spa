import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';

type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface AdminAppointment {
  id: number;
  client?: { id: number; name: string; email: string; phone?: string };
  service?: { id: number; name: string };
  employee?: { id: number; name: string };
  start_time: string;
  end_time: string;
  status: Status;
  notes: string;
  _saving?: boolean;
}

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Rezerwacje</h1>
        <p class="lead">Zarządzaj statusami wizyt i notatkami.</p>
      </div>
      <div class="actions">
        <div class="filters">
          <button *ngFor="let f of filters"
                  class="btn sm"
                  [class.primary]="activeFilter === f.value"
                  [class.ghost]="activeFilter !== f.value"
                  (click)="activeFilter = f.value">
            {{ f.label }} <small *ngIf="f.value !== 'all'">({{ countByStatus(f.value) }})</small>
          </button>
        </div>
      </div>
    </div>

    <div class="banner" *ngIf="message" [class.error]="isError">
      <span>{{ message }}</span>
      <button class="close" (click)="message=''">×</button>
    </div>

    <div *ngIf="loading" class="empty">Ładowanie…</div>
    <div *ngIf="!loading && filtered.length === 0" class="empty">
      <div class="icon">◉</div>
      <p>Brak rezerwacji w tej kategorii.</p>
    </div>

    <div class="card" style="padding:0;" *ngIf="!loading && filtered.length">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Termin</th>
              <th>Klient</th>
              <th>Usługa</th>
              <th>Pracownik</th>
              <th>Status</th>
              <th style="width:160px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of filtered">
              <td>
                <strong>{{ a.start_time | date:'dd.MM.yyyy' }}</strong>
                <div style="color:#8a817a; font-size:0.8rem;">
                  {{ a.start_time | date:'HH:mm' }} – {{ a.end_time | date:'HH:mm' }}
                </div>
              </td>
              <td>
                <strong>{{ a.client?.name || '—' }}</strong>
                <div style="color:#8a817a; font-size:0.78rem;">
                  {{ a.client?.email }}
                  <span *ngIf="a.client?.phone"> · {{ a.client?.phone }}</span>
                </div>
              </td>
              <td>{{ a.service?.name || '—' }}</td>
              <td>{{ a.employee?.name || '—' }}</td>
              <td>
                <select [(ngModel)]="a.status" (change)="updateStatus(a)">
                  <option value="pending">oczekująca</option>
                  <option value="confirmed">potwierdzona</option>
                  <option value="completed">ukończona</option>
                  <option value="cancelled">anulowana</option>
                </select>
              </td>
              <td>
                <button class="btn ghost sm" (click)="openNotes(a)">Notatki</button>
                <button class="btn danger sm" (click)="remove(a)">Usuń</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Notes modal -->
    <div class="modal-backdrop" *ngIf="editingNotes" (click)="editingNotes=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <h2>Notatki – {{ editingNotes.client?.name }}</h2>
          <button class="close" (click)="editingNotes=null">×</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>Notatki wewnętrzne</label>
            <textarea rows="6" [(ngModel)]="editingNotes.notes"></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn ghost" (click)="editingNotes=null">Anuluj</button>
          <button class="btn primary" (click)="saveNotes()">Zapisz</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../_shared/admin.styles.scss'],
  styles: [`
    .filters { display: flex; gap: 0.3rem; flex-wrap: wrap; }
    .table select { padding: 0.3rem 0.5rem; border: 1px solid #d9d0c0; border-radius: 6px; font-size: 0.85rem; }
  `]
})
export class AdminAppointmentsComponent implements OnInit {
  private api = inject(ApiService);

  items: AdminAppointment[] = [];
  loading = true;
  message = '';
  isError = false;
  activeFilter: string = 'all';
  editingNotes: AdminAppointment | null = null;

  filters = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'pending', label: 'Oczekujące' },
    { value: 'confirmed', label: 'Potwierdzone' },
    { value: 'completed', label: 'Ukończone' },
    { value: 'cancelled', label: 'Anulowane' },
  ];

  ngOnInit(): void {
    this.api.getAppointments().subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((x: any) => ({
          id: x.id, client: x.client, service: x.service, employee: x.employee,
          start_time: x.start_time, end_time: x.end_time,
          status: x.status, notes: x.notes || '',
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; this.showError('Nie udało się pobrać rezerwacji.'); }
    });
  }

  get filtered(): AdminAppointment[] {
    if (this.activeFilter === 'all') return this.items;
    return this.items.filter(a => a.status === this.activeFilter);
  }

  countByStatus(status: string): number {
    return this.items.filter(a => a.status === status).length;
  }

  updateStatus(a: AdminAppointment): void {
    this.api.updateAppointment(a.id, { status: a.status }).subscribe({
      next: () => this.showOk('Status zaktualizowany.'),
      error: () => this.showError('Błąd zapisu.'),
    });
  }

  openNotes(a: AdminAppointment): void { this.editingNotes = { ...a }; }

  saveNotes(): void {
    if (!this.editingNotes) return;
    const a = this.editingNotes;
    this.api.updateAppointment(a.id, { notes: a.notes, status: a.status }).subscribe({
      next: () => {
        this.items = this.items.map(x => x.id === a.id ? { ...x, notes: a.notes } : x);
        this.editingNotes = null;
        this.showOk('Zapisano.');
      },
      error: () => this.showError('Błąd zapisu.'),
    });
  }

  remove(a: AdminAppointment): void {
    if (!confirm(`Usunąć rezerwację ${a.client?.name || ''}?`)) return;
    this.api.deleteAppointment(a.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== a.id); this.showOk('Usunięto.'); },
      error: () => this.showError('Błąd usuwania.'),
    });
  }

  private showOk(m: string) { this.message = m; this.isError = false; setTimeout(() => this.message = '', 2500); }
  private showError(m: string) { this.message = m; this.isError = true; }
}

