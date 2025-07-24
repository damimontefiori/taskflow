import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="header">
        <div class="header-content">
          <h1 class="header-title">
            <span class="logo-icon">⚡</span>
            TaskFlow Dashboard
          </h1>
          <button class="btn-logout" (click)="logout()">
            <span class="logout-icon">👋</span>
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <main class="main-content">
        <div class="welcome-section">
          <div class="welcome-content">
            <h2 class="welcome-title">¡Bienvenido a TaskFlow!</h2>
            <p class="welcome-subtitle">Tu espacio de trabajo inteligente para gestionar proyectos y tareas</p>
            <div class="welcome-stats">
              <div class="stat-card">
                <div class="stat-number">{{ boards.length }}</div>
                <div class="stat-label">Tableros Activos</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ getTotalCards() }}</div>
                <div class="stat-label">Tareas Totales</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ getTotalLists() }}</div>
                <div class="stat-label">Listas Creadas</div>
              </div>
            </div>
          </div>
        </div>

        <div class="boards-section">
          <div class="section-header">
            <h3 class="section-title">Mis Tableros</h3>
            <button class="btn-create-board" (click)="createBoard()">
              <span class="plus-icon">+</span>
              Crear Tablero
            </button>
          </div>
          <div class="boards-grid">
            <div class="board-card" *ngFor="let board of boards">
              <div class="board-content" (click)="openBoard(board.id)">
                <div class="board-header">
                  <h4 class="board-name">{{ board.name }}</h4>
                  <div class="board-actions">
                    <button class="btn-action btn-edit" (click)="editBoard(board); $event.stopPropagation()" title="Editar tablero">
                      <span class="action-icon">✏️</span>
                    </button>
                    <button class="btn-action btn-delete" (click)="deleteBoard(board); $event.stopPropagation()" title="Eliminar tablero">
                      <span class="action-icon">🗑️</span>
                    </button>
                  </div>
                </div>
                <p class="board-description">{{ board.description }}</p>
                <div class="board-stats">
                  <div class="stat-item">
                    <span class="stat-icon">📋</span>
                    <span class="stat-text">{{ board.lists }} listas</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-icon">📝</span>
                    <span class="stat-text">{{ board.cards }} tarjetas</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="board-card new-board-card" (click)="createBoard()">
              <div class="new-board-content">
                <div class="plus-icon-large">+</div>
                <h4>Crear nuevo tablero</h4>
                <p>Organiza tu próximo proyecto</p>
              </div>
            </div>
          </div>
        </div>

        <div class="features-section">
          <div class="section-header">
            <h3 class="section-title">Características Principales</h3>
          </div>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📋</div>
              <h4 class="feature-title">Tableros Kanban</h4>
              <p class="feature-description">Organiza tus proyectos con tableros visuales e intuitivos</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📝</div>
              <h4 class="feature-title">Gestión de Tareas</h4>
              <p class="feature-description">Crea, edita y gestiona tarjetas con información detallada</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <h4 class="feature-title">Asignación de Usuarios</h4>
              <p class="feature-description">Asigna tareas a miembros del equipo para mejor colaboración</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <h4 class="feature-title">Seguimiento Visual</h4>
              <p class="feature-description">Monitorea el progreso con drag & drop entre columnas</p>
            </div>
          </div>
        </div>
      </main>

      <!-- Modal para crear tablero -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Crear Nuevo Tablero</h3>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre del tablero</label>
              <input 
                type="text" 
                placeholder="Ej: Mi nuevo proyecto"
                class="form-input"
                [(ngModel)]="newBoardName"
                (keyup.enter)="saveNewBoard()">
            </div>
            <div class="form-group">
              <label class="form-label">Descripción (opcional)</label>
              <textarea 
                placeholder="Describe tu proyecto..."
                class="form-input form-textarea"
                [(ngModel)]="newBoardDescription"></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveNewBoard()">Crear Tablero</button>
          </div>
        </div>
      </div>

      <!-- Modal para editar tablero -->
      <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Editar Tablero</h3>
            <button class="btn-close" (click)="closeEditModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre del tablero</label>
              <input 
                type="text" 
                [(ngModel)]="editBoardName"
                placeholder="Nombre del tablero"
                class="form-input"
                (keyup.enter)="saveEditBoard()">
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea 
                [(ngModel)]="editBoardDescription"
                placeholder="Descripción del tablero..."
                class="form-input form-textarea"></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeEditModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveEditBoard()">Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1a202c;
      overflow-x: hidden;
    }

    /* Header Styles */
    .header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title {
      color: white;
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 2rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .logout-icon {
      font-size: 1.1rem;
    }

    /* Main Content */
    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }

    /* Welcome Section */
    .welcome-section {
      text-align: center;
      margin-bottom: 4rem;
    }

    .welcome-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 3rem 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .welcome-title {
      font-size: 3rem;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
      letter-spacing: -0.025em;
    }

    .welcome-subtitle {
      font-size: 1.25rem;
      color: #64748b;
      margin-bottom: 2.5rem;
      font-weight: 400;
      line-height: 1.6;
    }

    .welcome-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .stat-card {
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-radius: 16px;
      padding: 2rem 1.5rem;
      text-align: center;
      border: 1px solid rgba(148, 163, 184, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.95rem;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Section Headers */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 600;
      color: white;
      letter-spacing: -0.025em;
    }

    .btn-create-board {
      background: rgba(255, 255, 255, 0.95);
      color: #6366f1;
      border: none;
      padding: 0.875rem 1.75rem;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .btn-create-board:hover {
      background: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }

    .plus-icon {
      font-size: 1.2rem;
      font-weight: bold;
    }

    /* Boards Grid */
    .boards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
      margin-bottom: 4rem;
    }

    .board-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      cursor: pointer;
    }

    .board-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .board-content {
      padding: 2rem;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .board-name {
      font-size: 1.3rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
      flex: 1;
      line-height: 1.3;
    }

    .board-actions {
      display: flex;
      gap: 0.5rem;
      margin-left: 1rem;
    }

    .btn-action {
      background: rgba(148, 163, 184, 0.1);
      border: none;
      border-radius: 8px;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-action:hover {
      background: rgba(148, 163, 184, 0.2);
      transform: scale(1.1);
    }

    .action-icon {
      font-size: 0.9rem;
    }

    .board-description {
      color: #64748b;
      font-size: 1rem;
      margin-bottom: 2rem;
      line-height: 1.5;
      flex: 1;
    }

    .board-stats {
      display: flex;
      gap: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .stat-icon {
      font-size: 1rem;
    }

    /* New Board Card */
    .new-board-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      border: 2px dashed rgba(255, 255, 255, 0.3);
      cursor: pointer;
    }

    .new-board-card:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
      border-color: rgba(255, 255, 255, 0.5);
    }

    .new-board-content {
      padding: 3rem 2rem;
      text-align: center;
      color: white;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .plus-icon-large {
      font-size: 3rem;
      font-weight: 300;
      margin-bottom: 1rem;
      opacity: 0.8;
    }

    .new-board-content h4 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .new-board-content p {
      font-size: 1rem;
      opacity: 0.8;
    }

    /* Features Section */
    .features-section {
      margin-top: 4rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1.5rem;
      display: block;
    }

    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .feature-description {
      color: #64748b;
      font-size: 1rem;
      line-height: 1.6;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      background: white;
      border-radius: 24px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .modal-header {
      padding: 2rem 2rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .btn-close:hover {
      background: #f1f5f9;
      color: #64748b;
    }

    .modal-body {
      padding: 1rem 2rem 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .form-input {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .form-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .form-textarea {
      min-height: 100px;
      resize: vertical;
    }

    .modal-actions {
      padding: 1rem 2rem 2rem;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      padding: 0.875rem 1.75rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #5855eb, #7c3aed);
      transform: translateY(-1px);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
    }

    .btn-secondary {
      background: #f8fafc;
      color: #64748b;
      border: 2px solid #e1e5e9;
      padding: 0.875rem 1.75rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
      color: #475569;
      border-color: #cbd5e1;
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-content {
        padding: 0 1rem;
      }

      .header-title {
        font-size: 1.5rem;
      }

      .main-content {
        padding: 2rem 1rem;
      }

      .welcome-title {
        font-size: 2rem;
      }

      .welcome-subtitle {
        font-size: 1.1rem;
      }

      .welcome-stats {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .boards-grid,
      .features-grid {
        grid-template-columns: 1fr;
      }

      .modal-content {
        margin: 1rem;
        width: calc(100% - 2rem);
      }
    }
  `]
})
export class DashboardComponent {
  showCreateModal = false;
  showEditModal = false;
  newBoardName = '';
  newBoardDescription = '';
  editBoardName = '';
  editBoardDescription = '';
  editingBoard: any = null;
  boards = [
    {
      id: 'proyecto-1',
      name: 'Proyecto 1',
      description: 'Desarrollo de aplicación web',
      lists: 5,
      cards: 12
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Campaña de verano 2024',
      lists: 3,
      cards: 8
    }
  ];

  constructor(private router: Router) {}

  getTotalCards(): number {
    return this.boards.reduce((total, board) => total + board.cards, 0);
  }

  getTotalLists(): number {
    return this.boards.reduce((total, board) => total + board.lists, 0);
  }

  logout() {
    this.router.navigate(['/']);
  }

  openBoard(boardId: string) {
    this.router.navigate(['/board', boardId]);
  }

  createBoard() {
    this.showCreateModal = true;
  }

  saveNewBoard() {
    if (this.newBoardName.trim()) {
      const newBoard = {
        id: this.newBoardName.toLowerCase().replace(/\s+/g, '-'),
        name: this.newBoardName,
        description: this.newBoardDescription || 'Nuevo proyecto',
        lists: 0,
        cards: 0
      };
      
      this.boards.push(newBoard);
      this.closeModal();
      alert(`¡Tablero "${this.newBoardName}" creado exitosamente!`);
    }
  }

  closeModal() {
    this.showCreateModal = false;
    this.newBoardName = '';
    this.newBoardDescription = '';
  }

  editBoard(board: any) {
    this.editingBoard = board;
    this.editBoardName = board.name;
    this.editBoardDescription = board.description;
    this.showEditModal = true;
  }

  saveEditBoard() {
    if (this.editBoardName.trim() && this.editingBoard) {
      const boardIndex = this.boards.findIndex(b => b.id === this.editingBoard.id);
      if (boardIndex > -1) {
        this.boards[boardIndex].name = this.editBoardName;
        this.boards[boardIndex].description = this.editBoardDescription || 'Proyecto actualizado';
        this.closeEditModal();
        alert(`¡Tablero "${this.editBoardName}" actualizado exitosamente!`);
      }
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editBoardName = '';
    this.editBoardDescription = '';
    this.editingBoard = null;
  }

  deleteBoard(board: any) {
    // Verificar si el tablero tiene tarjetas asignadas
    const totalCards = board.cards;
    
    if (totalCards > 0) {
      const confirmDelete = confirm(
        `⚠️ ATENCIÓN: Este tablero tiene ${totalCards} tarjetas asignadas.\n\n` +
        `Para eliminar el tablero, primero debes:\n` +
        `1. Desasignar todas las tarjetas de usuarios\n` +
        `2. Mover las tarjetas a otros tableros\n` +
        `3. O eliminar las tarjetas individualmente\n\n` +
        `¿Deseas abrir el tablero para gestionar las tarjetas?`
      );
      
      if (confirmDelete) {
        this.openBoard(board.id);
      }
    } else {
      const confirmDelete = confirm(
        `¿Estás seguro que deseas eliminar el tablero "${board.name}"?\n\n` +
        `Esta acción no se puede deshacer.`
      );
      
      if (confirmDelete) {
        const boardIndex = this.boards.findIndex(b => b.id === board.id);
        if (boardIndex > -1) {
          this.boards.splice(boardIndex, 1);
          alert(`¡Tablero "${board.name}" eliminado exitosamente!`);
        }
      }
    }
  }
}
