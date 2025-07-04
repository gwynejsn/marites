import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../environments/supabase';
import { Gender } from '../../shared/enums/gender';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styles: ``,
})
export class SignUpComponent {
  defaultProfilePicture =
    'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
  genders = Object.values(Gender);
  step: number = 1;
  profilePreview: string | ArrayBuffer | null = this.defaultProfilePicture;
  loading = false;
  error: string | null = null;
  private supabase = createClient(supabase.supabaseUrl, supabase.supabaseKey);

  formData = {
    firstName: '',
    lastName: '',
    age: null,
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: null as File | null,
  };

  constructor(private auth: Auth, private router: Router) {}

  signup() {
    console.log('Submitted:', this.formData);
    this.loading = true;
    // createUserWithEmailAndPassword(
    //   this.auth,
    //   this.formData.email,
    //   this.formData.password
    // )
    //   .then((res) => {
    //     this.router.navigate(['/chat-area']);
    //     this.loading = false;
    //   })
    //   .catch((err) => {
    //     this.error = this.handleCreateAccountError(err.code);
    //     this.loading = false;
    //   });
    this.uploadProfilePicture();
  }

  changeProfileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.formData.profilePicture = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfilePicture() {
    if (this.formData.profilePicture) {
      const filePath = this.formData.email + '/profile';
      this.supabase.storage
        .from('profile-picture')
        .upload(filePath, this.formData.profilePicture)
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
  }

  handleCreateAccountError(errMsg: string): string {
    switch (errMsg) {
      case 'auth/email-already-in-use':
        return 'This email is already associated with an account.';
      case 'auth/invalid-email':
        return 'The email address is badly formatted.';
      case 'auth/operation-not-allowed':
        return 'Creating accounts is currently disabled. Please contact support.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/internal-error':
        return 'An internal error occurred. Please try again.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  }
}
