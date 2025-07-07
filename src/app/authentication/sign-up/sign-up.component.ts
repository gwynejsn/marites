import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CloudinaryModule } from '@cloudinary/ng';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { storeStructure } from '../../app.config';
import {
  resetLoadingError,
  signUpStart,
} from '../../main-interface/user-profile/store/user-profile.actions';
import {
  selectUserProfile,
  selectUserProfileError,
  selectUserProfileLoading,
} from '../../main-interface/user-profile/store/user-profile.selectors';
import { UserProfileService } from '../../main-interface/user-profile/user-profile.service';
import { gender } from '../../shared/types';

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
    private auth: Auth,
    private router: Router,
    private userProfileService: UserProfileService,
    private store$: Store<storeStructure>
  ) {
    store$.dispatch(resetLoadingError());
    this.loading$ = store$.pipe(select(selectUserProfileLoading));
    this.error$ = store$.pipe(select(selectUserProfileError));
    this.loading$.subscribe((loading) => console.log('loading is ', loading));
  }

  async signup() {
    this.store$.dispatch(
      signUpStart({
        form: {
          firstName: this.formData.firstName,
          lastName: this.formData.lastName,
          age: this.formData.age!,
          gender: this.formData.gender as gender,
          email: this.formData.email,
          password: this.formData.password,
          profilePicture: this.formData.profilePicture,
        },
      })
    );
    this.store$.pipe(select(selectUserProfile)).subscribe((up) => {
      if (up.userProfile) this.router.navigate(['/chat-area']);
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
