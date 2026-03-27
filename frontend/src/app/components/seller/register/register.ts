import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthApi } from '../../../services/auth/auth-api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class SellerRegister {
  name: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  private readonly role: string = 'seller';

  constructor(private authApi: AuthApi, private router: Router) {}

  onSubmit() {
    const seller = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: this.role // always 'seller'
    };
    this.authApi.registerUser(seller).subscribe({
      next: (response: any) => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/seller']); // Redirect to seller dashboard or home
      },
      error: (error: any) => {
        console.error('Seller registration failed:', error);
      }
    });
  }
}
