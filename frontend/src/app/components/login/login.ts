import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthApi } from '../../services/auth/auth-api';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  constructor(private authApi: AuthApi, private router: Router) {}
  
  email: string = '';
  password: string = '';

  onSubmit() {
    this.authApi.login(this.email, this.password).subscribe({
      next: (response: any) => {
        
        // store token in localStorage
        localStorage.setItem('token', response.token);

        const role = response.user.role;
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'customer') {
          this.router.navigate(['/users']);
        } else if (role === 'seller') {
          this.router.navigate(['/seller']);
        }
        else {
          console.error('Unknown user role:', role);
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }
}
