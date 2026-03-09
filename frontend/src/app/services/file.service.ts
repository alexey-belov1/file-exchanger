import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FileItem {
  id: string;
  originalName: string;
  size: number;
  retentionMinutes: number;
  uploadedAt: string;
  expiresAt: string;
  uploaderUsername: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = '/api/files';

  constructor(private http: HttpClient) {}

  getFiles(): Observable<FileItem[]> {
    return this.http.get<FileItem[]>(this.apiUrl);
  }

  uploadFile(file: File, retentionMinutes?: number): Observable<FileItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (retentionMinutes) {
      formData.append('retentionMinutes', retentionMinutes.toString());
    }
    return this.http.post<FileItem>(`${this.apiUrl}/upload`, formData);
  }

  deleteFile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadUrl(id: string): string {
    return `${this.apiUrl}/${id}/download`;
  }
}
