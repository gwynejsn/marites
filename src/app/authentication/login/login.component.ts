import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent {
  error: string | null = null;
  loading = false;

  constructor(private auth: Auth, private router: Router) {}

  login(val: { email: string; password: string }) {
    this.loading = true;
    signInWithEmailAndPassword(this.auth, val.email, val.password)
      .then((res) => {
        this.router.navigate(['/chat-area']);
        this.loading = false;
      })
      .catch((err) => {
        this.error = this.handleErrorMessages(err.code);
        this.loading = false;
      });
  }

  handleErrorMessages(errMsg: string) {
    switch (errMsg) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/invalid-email':
        return 'The email address is badly formatted.';
      case 'auth/internal-error':
        return 'An internal error occurred. Please try again.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  }
}
