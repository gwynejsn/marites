import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CloudinaryModule } from '@cloudinary/ng';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { storeStructure } from '../../app.config';
import { gender } from '../../shared/types';
import { AuthenticationService } from '../authentication.service';
import {
  selectAuthError,
  selectAuthLoading,
} from '../store/authentication.selectors';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, FormsModule, RouterLink, CloudinaryModule],
  templateUrl: './sign-up.component.html',
  styles: ``,
})
export class SignUpComponent {
  genders = ['Male', 'Female', 'Other'];
  step: number = 1;
  profilePreview: string | ArrayBuffer | null =
    environment.defaultProfilePicture;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  isMobile = false;

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

  constructor(
    private store$: Store<storeStructure>,
    private authenticationService: AuthenticationService
  ) {
    this.loading$ = store$.pipe(select(selectAuthLoading));
    this.error$ = store$.pipe(select(selectAuthError));
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // md breakpoint
  }

  async signup() {
    this.authenticationService.signUp({
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      age: this.formData.age!,
      gender: this.formData.gender as gender,
      email: this.formData.email,
      password: this.formData.password,
      profilePicture: this.formData.profilePicture,
    });
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
}
