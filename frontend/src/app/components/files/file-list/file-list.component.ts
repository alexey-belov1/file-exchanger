import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService, FileItem } from '../../../services/file.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Файлы</h2>
      <button class="btn btn-primary" (click)="showUploadForm = !showUploadForm">
        {{ showUploadForm ? 'Отмена' : 'Загрузить файл' }}
      </button>
    </div>

    <div class="card mb-4 shadow-sm" *ngIf="showUploadForm">
      <div class="card-body">
        <h5 class="card-title">Загрузка файла</h5>
        <div class="row align-items-end">
          <div class="col-md-6 mb-3 mb-md-0">
            <label class="form-label">Выберите файл</label>
            <input type="file" class="form-control" (change)="onFileSelected($event)">
          </div>
          <div class="col-md-4 mb-3 mb-md-0">
            <label class="form-label">Время хранения (минут)</label>
            <input type="number" class="form-control" [(ngModel)]="retentionMinutes" min="1" placeholder="По умолчанию: 30">
          </div>
          <div class="col-md-2">
            <button class="btn btn-success w-100" (click)="upload()" [disabled]="!selectedFile || uploading">
              {{ uploading ? 'Загрузка...' : 'Загрузить' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <table class="table table-striped table-hover align-middle">
      <thead>
        <tr>
          <th>Имя файла</th>
          <th>Размер</th>
          <th *ngIf="isAdmin">Загрузил</th>
          <th>Загружен</th>
          <th>Истекает</th>
          <th class="text-end">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let file of files">
          <td>{{ file.originalName }}</td>
          <td>{{ formatSize(file.size) }}</td>
          <td *ngIf="isAdmin">{{ file.uploaderUsername }}</td>
          <td>{{ file.uploadedAt | date:'short' }}</td>
          <td [class.text-danger]="isExpiringSoon(file.expiresAt)">{{ file.expiresAt | date:'short' }}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" (click)="download(file.id)">Скачать</button>
            <button class="btn btn-sm btn-outline-danger" (click)="deleteFile(file.id)">Удалить</button>
          </td>
        </tr>
        <tr *ngIf="files.length === 0">
          <td [attr.colspan]="isAdmin ? 6 : 5" class="text-center text-muted py-4">Нет файлов</td>
        </tr>
      </tbody>
    </table>
  `
})
export class FileListComponent implements OnInit {
  private fileService = inject(FileService);
  private authService = inject(AuthService);

  files: FileItem[] = [];
  showUploadForm = false;
  selectedFile: File | null = null;
  retentionMinutes: number | null = null;
  uploading = false;
  isAdmin = false;

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.loadFiles();
  }

  loadFiles() {
    this.fileService.getFiles().subscribe(files => this.files = files);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.fileService.uploadFile(this.selectedFile, this.retentionMinutes ?? undefined).subscribe({
      next: () => {
        this.loadFiles();
        this.selectedFile = null;
        this.retentionMinutes = null;
        this.showUploadForm = false;
        this.uploading = false;
      },
      error: () => {
        alert('Ошибка при загрузке файла');
        this.uploading = false;
      }
    });
  }

  download(id: string) {
    const token = localStorage.getItem('token');
    fetch(this.fileService.downloadUrl(id), {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'downloaded_file';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
            if (filenameMatch && filenameMatch.length === 2) {
                filename = decodeURIComponent(filenameMatch[1]);
            }
        }
        return response.blob().then(blob => ({ blob, filename }));
    })
    .then(({blob, filename}) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    })
    .catch(err => alert('Ошибка при скачивании файла'));
  }

  deleteFile(id: string) {
    if (confirm('Вы уверены, что хотите удалить файл?')) {
      this.fileService.deleteFile(id).subscribe(() => this.loadFiles());
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isExpiringSoon(expiresAt: string): boolean {
    const timeToExpiry = new Date(expiresAt).getTime() - new Date().getTime();
    return timeToExpiry > 0 && timeToExpiry < 5 * 60 * 1000;
  }
}
