import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>TaskFlow</h1>
        <h2>Iniciar Sesión</h2>
        <p>Sistema de gestión de tareas estilo Trello</p>
        <div class="login-form">
          <input type="email" placeholder="Email" class="form-input" #emailInput>
          <input type="password" placeholder="Contraseña" class="form-input" #passwordInput>
          <button class="btn-primary" (click)="login(emailInput.value, passwordInput.value)">Iniciar Sesión</button>
        </div>
        <div class="auth-link">
          <p>¿No tienes cuenta? <a href="#" (click)="goToDashboard()">Ver Demo</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .auth-card {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }

    h1 {
      color: #667eea;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }

    h2 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    p {
      color: #666;
      margin-bottom: 2rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .form-input {
      padding: 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary:hover {
      background: #5a6fd8;
    }

    .auth-link a {
      color: #667eea;
      text-decoration: none;
    }

    .auth-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  constructor(private router: Router) {}

  login(email?: string, password?: string) {
    // For demo purposes, any login will work
    console.log('Login attempt:', email, password);
    this.router.navigate(['/dashboard']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
