import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthApi } from '../../../services/auth/auth-api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class UserRegister {
  name: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  private readonly role: string = 'customer';

  constructor(private authApi: AuthApi, private router: Router) {}

  onSubmit() {
    const user = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: this.role
    };
    this.authApi.registerUser(user).subscribe({
      next: (response: any) => {
        console.log('Registration successful:', response);
        localStorage.setItem('token', response.token);
        this.router.navigate(['/users']); // Redirect to userDashboard
      },
      error: (error: any) => {
        console.error('Registration failed:', error);
      }
    });
  }
}

