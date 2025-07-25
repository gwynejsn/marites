import { Injectable } from '@angular/core';
import { cloudinary } from '../../environments/cloudinary';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  async upload(file: File): Promise<string> {
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', cloudinary.presetName);

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/upload`;

      const res = await fetch(endpoint, {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cloudinary upload failed: ${res.status} ${errText}`);
      }

      const result = await res.json();
      return result.secure_url || result.url || null;
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }
}
