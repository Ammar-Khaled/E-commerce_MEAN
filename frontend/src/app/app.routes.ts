import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { AdminDashboard } from './components/admin/dashboard/dashboard';
import { UserDashboard } from './components/user/dashboard/dashboard';
import { SellerDashboard } from './components/seller/dashboard/dashboard';
import { UserRegister } from './components/user/register/register';
import { SellerRegister } from './components/seller/register/register';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'admin', component: AdminDashboard },
    
    { path: 'users', component: UserDashboard }, 
    { path: 'users/register', component: UserRegister },

    { path: 'seller', component: SellerDashboard },
    { path: 'seller/register', component: SellerRegister },
];
