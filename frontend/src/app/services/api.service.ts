import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://headaryspa.motivogroup.pl/api';

  constructor(private http: HttpClient) {}

  // Generic methods
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`);
  }

  // Services endpoints
  getServices(): Observable<any[]> {
    return this.get('services');
  }

  getService(id: number): Observable<any> {
    return this.get(`services/${id}`);
  }

  createService(data: any): Observable<any> { return this.post('services', data); }
  updateService(id: number, data: any): Observable<any> { return this.put(`services/${id}`, data); }
  deleteService(id: number): Observable<any> { return this.delete(`services/${id}`); }

  // Gallery endpoints
  getGallery(): Observable<any[]> {
    return this.get('gallery');
  }

  getGalleryItem(id: number): Observable<any> {
    return this.get(`gallery/${id}`);
  }

  createGalleryItem(data: any): Observable<any> { return this.post('gallery', data); }
  updateGalleryItem(id: number, data: any): Observable<any> { return this.put(`gallery/${id}`, data); }
  deleteGalleryItem(id: number): Observable<any> { return this.delete(`gallery/${id}`); }

  // Employees endpoints
  getEmployees(): Observable<any[]> {
    return this.get('employees');
  }

  getEmployee(id: number): Observable<any> {
    return this.get(`employees/${id}`);
  }

  createEmployee(data: any): Observable<any> { return this.post('employees', data); }
  updateEmployee(id: number, data: any): Observable<any> { return this.put(`employees/${id}`, data); }
  deleteEmployee(id: number): Observable<any> { return this.delete(`employees/${id}`); }

   // Settings endpoints
   getSettings(): Observable<any> {
     return this.get('settings');
   }

   getSetting(key: string): Observable<any> {
     return this.get(`settings/${key}`);
   }

   createSetting(data: any): Observable<any> { return this.post('settings', data); }
   updateSetting(key: string, data: any): Observable<any> { return this.put(`settings/${key}`, data); }
   deleteSetting(key: string): Observable<any> { return this.delete(`settings/${key}`); }

   // Reviews endpoints
   getReviews(): Observable<any[]> {
     return this.get('reviews');
   }

   getApprovedReviews(): Observable<any[]> {
     return this.get('reviews', { is_approved: true });
   }

   getFeaturedReviews(): Observable<any[]> {
     return this.get('reviews', { is_featured: true, is_approved: true });
   }

   createReview(review: any): Observable<any> {
     return this.post('reviews', review);
   }

   updateReview(id: number, review: any): Observable<any> {
     return this.put(`reviews/${id}`, review);
   }

   deleteReview(id: number): Observable<any> {
     return this.delete(`reviews/${id}`);
   }

   // Packages endpoints
   getPackages(): Observable<any[]> {
     return this.get('packages');
   }

   getPackage(id: number): Observable<any> {
     return this.get(`packages/${id}`);
   }

   createPackage(data: any): Observable<any> { return this.post('packages', data); }
   updatePackage(id: number, data: any): Observable<any> { return this.put(`packages/${id}`, data); }
   deletePackage(id: number): Observable<any> { return this.delete(`packages/${id}`); }

   // Appointments endpoints
   createAppointment(appointment: any): Observable<any> {
     return this.post('appointments', appointment);
   }

   getAppointments(): Observable<any[]> {
     return this.get('appointments');
   }

   updateAppointment(id: number, data: any): Observable<any> { return this.put(`appointments/${id}`, data); }
   deleteAppointment(id: number): Observable<any> { return this.delete(`appointments/${id}`); }

   // Voucher endpoint
   sendVoucher(data: any): Observable<any> {
     return this.post('voucher', data);
   }

   /* ---------------- Page sections ---------------- */

   // Public
   getPageSections(pageKey: string): Observable<any[]> {
     return this.get(`pages/${pageKey}/sections`);
   }

   // Admin
   adminGetPageSections(pageKey: string): Observable<any[]> {
     return this.get(`admin/pages/${pageKey}/sections`);
   }

   getPageSection(id: number): Observable<any> {
     return this.get(`page-sections/${id}`);
   }

   createPageSection(data: any): Observable<any> {
     return this.post('page-sections', data);
   }

   updatePageSection(id: number, data: any): Observable<any> {
     return this.put(`page-sections/${id}`, data);
   }

   deletePageSection(id: number): Observable<any> {
     return this.delete(`page-sections/${id}`);
   }

   reorderPageSections(items: { id: number; order: number }[]): Observable<any> {
     return this.post('page-sections/reorder', { items });
   }

   uploadPageSectionImage(file: File): Observable<any> {
     const formData = new FormData();
     formData.append('image', file);
     // Let browser set multipart Content-Type with boundary automatically
     return this.http.post(`${this.apiUrl}/page-sections/upload-image`, formData);
   }

   /** Generic image upload (gallery, service images, employee avatars, etc.). */
   uploadImage(file: File, folder: string = 'uploads'): Observable<any> {
     const formData = new FormData();
     formData.append('image', file);
     formData.append('folder', folder);
     return this.http.post(`${this.apiUrl}/admin/upload-image`, formData);
   }

   /* ---------------- Gallery files (file-based manager) ---------------- */

   /** List all image files from storage/app/public/images. */
   getGalleryFiles(): Observable<Array<{ name: string; path: string; url: string; size: number; modified: number }>> {
     return this.http.get<any[]>(`${this.apiUrl}/admin/gallery/files`);
   }

   /** Upload a new image file into the gallery images directory. */
   uploadGalleryFile(file: File): Observable<any> {
     const formData = new FormData();
     formData.append('image', file);
     return this.http.post(`${this.apiUrl}/admin/gallery/files`, formData);
   }

   /** Delete an image file from the gallery images directory. */
   deleteGalleryFile(name: string): Observable<any> {
     return this.http.delete(`${this.apiUrl}/admin/gallery/files/${encodeURIComponent(name)}`);
   }

   /** Auto-translate a piece of text. Languages: 'pl' | 'en' | 'fi'. */
   translate(text: string, source: string, target: string): Observable<any> {
     return this.post('admin/translate', { text, source, target });
   }
 }
