import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  position: number;
  assignedTo?: string;
  assignedToName?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

interface List {
  id: string;
  title: string;
  boardId: string;
  position: number;
  cards: Card[];
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="board-container">
      <header class="board-header">
        <div class="board-info">
          <h1>{{ boardName }}</h1>
          <p>{{ boardDescription }}</p>
          <div class="board-stats-header" *ngIf="getBoardStats().cards > 0">
            <span class="stat-item">📋 {{ getBoardStats().lists }} listas</span>
            <span class="stat-item">🎯 {{ getBoardStats().cards }} tarjetas</span>
            <span class="stat-item" *ngIf="getBoardStats().assignedCards > 0">
              👥 {{ getBoardStats().assignedCards }} asignadas
            </span>
            <span class="stat-item warning" *ngIf="getBoardStats().assignedCards > 0">
              ⚠️ Gestionar antes de eliminar tablero
            </span>
          </div>
        </div>
        <div class="board-actions">
          <button class="btn-secondary" (click)="goBack()">← Volver al Dashboard</button>
          <button class="btn-primary" (click)="createList()">+ Crear Lista</button>
        </div>
      </header>

      <div class="board-content">
        <div class="lists-container">
          <div class="list" *ngFor="let list of lists">
            <div class="list-header">
              <h3>{{ list.title }}</h3>
              <div class="list-actions">
                <button class="btn-list-action" (click)="editList(list)" title="Editar lista">✏️</button>
                <button class="btn-list-action" (click)="deleteList(list)" title="Eliminar lista">🗑️</button>
              </div>
            </div>
            <div class="list-cards" 
                 (dragover)="onDragOver($event)" 
                 (dragenter)="onDragEnter($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event, list.id)">
              <div class="card-item" 
                   *ngFor="let card of list.cards"
                   draggable="true"
                   (dragstart)="onDragStart($event, card)"
                   (dragend)="onDragEnd($event)"
                   (click)="editCard(card)">
                <div class="card-drag-handle">⋮⋮</div>
                <div class="card-priority" [ngClass]="'priority-' + card.priority">
                  {{ getPriorityIcon(card.priority) }}
                </div>
                <h4>{{ card.title }}</h4>
                <p *ngIf="card.description" class="card-description">{{ card.description }}</p>
                
                <div class="card-meta" *ngIf="card.assignedToName || card.dueDate">
                  <div class="card-assigned" *ngIf="card.assignedToName">
                    <span class="user-avatar">{{ getInitials(card.assignedToName) }}</span>
                    <span class="assigned-name">{{ card.assignedToName }}</span>
                  </div>
                  <div class="card-due-date" *ngIf="card.dueDate" [ngClass]="getDueDateClass(card.dueDate)">
                    {{ formatDate(card.dueDate) }}
                  </div>
                </div>
              </div>
            </div>
            <button class="btn-add-card" (click)="createCard(list.id)">+ Agregar tarjeta</button>
          </div>
          
          <div class="add-list-container">
            <button class="btn-add-list" (click)="createList()">+ Agregar lista</button>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar lista -->
      <div class="modal-overlay" *ngIf="showListModal" (click)="closeListModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ editingList ? 'Editar Lista' : 'Crear Nueva Lista' }}</h3>
            <button class="btn-close" (click)="closeListModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre de la lista</label>
              <input 
                type="text" 
                [(ngModel)]="newListTitle"
                placeholder="Ej: To Do, En Progreso, Completado"
                class="form-input"
                (keyup.enter)="saveList()">
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeListModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveList()">{{ editingList ? 'Actualizar' : 'Crear' }} Lista</button>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar tarjeta -->
      <div class="modal-overlay" *ngIf="showCardModal" (click)="closeCardModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ editingCard ? 'Editar Tarjeta' : 'Crear Nueva Tarjeta' }}</h3>
            <button class="btn-close" (click)="closeCardModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Título de la tarjeta</label>
              <input 
                type="text" 
                [(ngModel)]="newCardTitle"
                placeholder="Ej: Diseñar interfaz de usuario"
                class="form-input"
                (keyup.enter)="saveCard()">
            </div>
            <div class="form-group">
              <label class="form-label">Descripción (opcional)</label>
              <textarea 
                [(ngModel)]="newCardDescription"
                placeholder="Describe los detalles de esta tarea..."
                class="form-input form-textarea"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Prioridad</label>
              <select [(ngModel)]="newCardPriority" class="form-input">
                <option value="">Sin prioridad</option>
                <option value="low">🟢 Baja</option>
                <option value="medium">🟡 Media</option>
                <option value="high">🔴 Alta</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Fecha de vencimiento (opcional)</label>
              <input 
                type="date" 
                [(ngModel)]="newCardDueDate"
                class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Asignar a usuario</label>
              <select [(ngModel)]="newCardAssignedTo" class="form-input">
                <option value="">Sin asignar</option>
                <option *ngFor="let user of availableUsers" [value]="user.id">{{ user.name }}</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-danger" *ngIf="editingCard" (click)="deleteCard()">Eliminar</button>
            <button class="btn-secondary" (click)="closeCardModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveCard()">{{ editingCard ? 'Actualizar' : 'Crear' }} Tarjeta</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .board-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
      padding: 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    .board-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 2rem;
      border-radius: 20px;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .board-info h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .board-info p {
      color: #64748b;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .board-stats-header {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .stat-item {
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      padding: 0.5rem 1rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .stat-item.warning {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-color: #f59e0b;
      color: #92400e;
    }

    .board-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      flex: 0 0 auto;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #5855eb, #7c3aed);
      transform: translateY(-1px);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: #6366f1;
      border: 2px solid rgba(255, 255, 255, 0.5);
    }

    .btn-secondary:hover {
      background: white;
      transform: translateY(-1px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

    .board-content {
      padding: 0 1rem;
    }

    .lists-container {
      display: flex;
      gap: 2rem;
      overflow-x: auto;
      padding-bottom: 2rem;
      min-height: 60vh;
    }

    .list {
      min-width: 320px;
      max-width: 320px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      height: fit-content;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .list-header h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .list-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-list-action {
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

    .btn-list-action:hover {
      background: rgba(148, 163, 184, 0.2);
      transform: scale(1.1);
    }

    .list-cards {
      min-height: 100px;
      margin-bottom: 1rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      padding: 0.5rem;
    }

    .list-cards.drag-over {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
      border: 2px dashed #6366f1;
    }

    .card-item {
      background: white;
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 0.75rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(226, 232, 240, 0.8);
      position: relative;
      user-select: none;
    }

    .card-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .card-item.dragging {
      opacity: 0.8;
      transform: rotate(5deg) scale(1.02);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }

    .card-drag-handle {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      color: #94a3b8;
      font-size: 0.8rem;
      cursor: grab;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .card-item:hover .card-drag-handle {
      opacity: 1;
    }

    .card-drag-handle:active {
      cursor: grabbing;
    }

    .card-priority {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      font-size: 0.8rem;
    }

    .card-item h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
      padding-right: 1.5rem;
    }

    .card-description {
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 1rem;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid #f1f5f9;
    }

    .card-assigned {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    .user-avatar {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .assigned-name {
      color: #64748b;
      font-weight: 500;
    }

    .card-due-date {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-weight: 500;
    }

    .card-due-date.due-soon {
      background: #fef3c7;
      color: #92400e;
    }

    .card-due-date.overdue {
      background: #fee2e2;
      color: #dc2626;
    }

    .card-due-date.due-today {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .btn-add-card, .btn-add-list {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
      border: 2px dashed rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      color: #6366f1;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-add-card:hover, .btn-add-list:hover {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
      border-color: rgba(99, 102, 241, 0.5);
      transform: translateY(-1px);
    }

    .add-list-container {
      min-width: 300px;
      display: flex;
      align-items: flex-start;
      padding-top: 1rem;
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
      padding: 1rem;
      box-sizing: border-box;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 450px;
      max-height: 85vh;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 1.5rem 1.5rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      min-width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      background: #f1f5f9;
      color: #64748b;
    }

    .modal-body {
      padding: 1rem 1.5rem;
      overflow-y: auto;
      flex-grow: 1;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      font-family: inherit;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .form-textarea {
      min-height: 80px;
      resize: vertical;
      max-height: 150px;
    }

    .modal-actions {
      padding: 1rem 1.5rem;
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      border-top: 1px solid #f1f5f9;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
      flex: 0 0 auto;
    }

    .btn-danger:hover {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      transform: translateY(-1px);
      box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
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
      .board-container {
        padding: 1rem;
      }

      .board-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .board-info h1 {
        font-size: 2rem;
      }

      .lists-container {
        flex-direction: column;
        gap: 1rem;
      }

      .list {
        min-width: 100%;
        max-width: 100%;
      }

      .modal-overlay {
        padding: 0.5rem;
      }

      .modal-content {
        max-width: 100%;
        max-height: 95vh;
        border-radius: 12px;
      }

      .modal-header {
        padding: 1rem;
      }

      .modal-title {
        font-size: 1.1rem;
      }

      .modal-body {
        padding: 0.75rem 1rem;
      }

      .modal-actions {
        padding: 0.75rem 1rem;
        gap: 0.5rem;
      }

      .btn-primary, .btn-secondary, .btn-danger {
        padding: 0.625rem 1rem;
        font-size: 0.85rem;
        border-radius: 6px;
      }

      .form-input {
        padding: 0.625rem;
        font-size: 0.9rem;
      }

      .form-textarea {
        min-height: 60px;
        max-height: 100px;
      }
    }

    @media (max-height: 600px) {
      .modal-content {
        max-height: 90vh;
      }

      .modal-body {
        padding: 0.5rem 1rem;
      }

      .form-group {
        margin-bottom: 0.75rem;
      }

      .form-textarea {
        min-height: 50px;
        max-height: 80px;
      }
    }
  `]
})
export class BoardComponent implements OnInit {
  boardId: string = '';
  boardName: string = 'Mi Tablero de Proyecto';
  boardDescription: string = 'Organiza y gestiona las tareas de tu proyecto';
  
  lists: List[] = [
    {
      id: 'list-1',
      title: 'Por Hacer',
      boardId: 'board-1',
      position: 1,
      cards: [
        {
          id: 'card-1',
          title: 'Diseñar interfaz de usuario',
          description: 'Crear mockups y wireframes para la aplicación',
          listId: 'list-1',
          position: 1,
          priority: 'high',
          dueDate: '2025-07-25',
          createdAt: '2025-07-24T10:00:00Z',
          assignedTo: 'user-1',
          assignedToName: 'Ana García'
        },
        {
          id: 'card-2',
          title: 'Configurar base de datos',
          description: 'Establecer conexión y crear tablas necesarias',
          listId: 'list-1',
          position: 2,
          priority: 'medium',
          createdAt: '2025-07-24T11:00:00Z'
        }
      ]
    },
    {
      id: 'list-2',
      title: 'En Progreso',
      boardId: 'board-1',
      position: 2,
      cards: [
        {
          id: 'card-3',
          title: 'Implementar autenticación',
          description: 'Sistema de login y registro de usuarios',
          listId: 'list-2',
          position: 1,
          priority: 'high',
          dueDate: '2025-07-26',
          createdAt: '2025-07-24T09:00:00Z',
          assignedTo: 'user-2',
          assignedToName: 'Carlos López'
        }
      ]
    },
    {
      id: 'list-3',
      title: 'Completado',
      boardId: 'board-1',
      position: 3,
      cards: [
        {
          id: 'card-4',
          title: 'Configurar proyecto inicial',
          description: 'Estructura básica del proyecto y dependencias',
          listId: 'list-3',
          position: 1,
          priority: 'low',
          createdAt: '2025-07-23T15:00:00Z',
          assignedTo: 'user-1',
          assignedToName: 'Ana García'
        }
      ]
    }
  ];

  availableUsers = [
    { id: 'user-1', name: 'Ana García' },
    { id: 'user-2', name: 'Carlos López' },
    { id: 'user-3', name: 'María Rodríguez' },
    { id: 'user-4', name: 'David Martínez' }
  ];

  // Modal states
  showListModal = false;
  showCardModal = false;
  editingList: List | null = null;
  editingCard: Card | null = null;
  newListTitle = '';
  newCardTitle = '';
  newCardDescription = '';
  newCardPriority = '';
  newCardDueDate = '';
  newCardAssignedTo = '';
  currentListId = '';

  // Drag & Drop properties
  draggedCard: Card | null = null;
  draggedFromListId = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.boardId = params['id'] || 'board-1';
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // List management
  createList() {
    this.editingList = null;
    this.newListTitle = '';
    this.showListModal = true;
  }

  editList(list: List) {
    this.editingList = list;
    this.newListTitle = list.title;
    this.showListModal = true;
  }

  saveList() {
    if (this.newListTitle.trim()) {
      if (this.editingList) {
        // Edit existing list
        this.editingList.title = this.newListTitle;
      } else {
        // Create new list
        const newList: List = {
          id: 'list-' + Date.now(),
          title: this.newListTitle,
          boardId: this.boardId,
          position: this.lists.length + 1,
          cards: []
        };
        this.lists.push(newList);
      }
      this.closeListModal();
    }
  }

  deleteList(list: List) {
    if (list.cards.length > 0) {
      const confirmDelete = confirm(
        `⚠️ Esta lista tiene ${list.cards.length} tarjetas.\\n\\n` +
        `Para eliminar la lista, primero debes:\\n` +
        `1. Mover todas las tarjetas a otras listas\\n` +
        `2. O eliminar las tarjetas individualmente\\n\\n` +
        `¿Deseas proceder eliminando todas las tarjetas?`
      );
      
      if (!confirmDelete) return;
    }
    
    const index = this.lists.findIndex(l => l.id === list.id);
    if (index > -1) {
      this.lists.splice(index, 1);
    }
  }

  closeListModal() {
    this.showListModal = false;
    this.editingList = null;
    this.newListTitle = '';
  }

  // Card management
  createCard(listId: string) {
    this.editingCard = null;
    this.currentListId = listId;
    this.newCardTitle = '';
    this.newCardDescription = '';
    this.newCardPriority = '';
    this.newCardDueDate = '';
    this.newCardAssignedTo = '';
    this.showCardModal = true;
  }

  editCard(card: Card) {
    this.editingCard = card;
    this.currentListId = card.listId;
    this.newCardTitle = card.title;
    this.newCardDescription = card.description || '';
    this.newCardPriority = card.priority || '';
    this.newCardDueDate = card.dueDate || '';
    this.newCardAssignedTo = card.assignedTo || '';
    this.showCardModal = true;
  }

  saveCard() {
    if (this.newCardTitle.trim()) {
      const assignedUser = this.availableUsers.find(u => u.id === this.newCardAssignedTo);
      
      if (this.editingCard) {
        // Edit existing card
        this.editingCard.title = this.newCardTitle;
        this.editingCard.description = this.newCardDescription;
        this.editingCard.priority = this.newCardPriority as 'low' | 'medium' | 'high';
        this.editingCard.dueDate = this.newCardDueDate;
        this.editingCard.assignedTo = this.newCardAssignedTo;
        this.editingCard.assignedToName = assignedUser?.name;
      } else {
        // Create new card
        const list = this.lists.find(l => l.id === this.currentListId);
        if (list) {
          const newCard: Card = {
            id: 'card-' + Date.now(),
            title: this.newCardTitle,
            description: this.newCardDescription,
            listId: this.currentListId,
            position: list.cards.length + 1,
            priority: this.newCardPriority as 'low' | 'medium' | 'high',
            dueDate: this.newCardDueDate,
            assignedTo: this.newCardAssignedTo,
            assignedToName: assignedUser?.name,
            createdAt: new Date().toISOString()
          };
          list.cards.push(newCard);
        }
      }
      this.closeCardModal();
    }
  }

  deleteCard() {
    if (this.editingCard) {
      const assignedWarning = this.editingCard.assignedToName 
        ? `\\n\\n⚠️ Esta tarjeta está asignada a ${this.editingCard.assignedToName}`
        : '';
      
      const confirmDelete = confirm(
        `¿Estás seguro que deseas eliminar la tarjeta "${this.editingCard.title}"?${assignedWarning}\\n\\nEsta acción no se puede deshacer.`
      );
      
      if (confirmDelete) {
        const list = this.lists.find(l => l.id === this.editingCard!.listId);
        if (list) {
          const cardIndex = list.cards.findIndex(c => c.id === this.editingCard!.id);
          if (cardIndex > -1) {
            list.cards.splice(cardIndex, 1);
            this.updateCardPositions(list);
          }
        }
        this.closeCardModal();
      }
    }
  }

  closeCardModal() {
    this.showCardModal = false;
    this.editingCard = null;
    this.newCardTitle = '';
    this.newCardDescription = '';
    this.newCardPriority = '';
    this.newCardDueDate = '';
    this.newCardAssignedTo = '';
    this.currentListId = '';
  }

  // Drag & Drop methods with improved functionality
  onDragStart(event: DragEvent, card: Card) {
    this.draggedCard = card;
    this.draggedFromListId = card.listId;
    
    // Agregar efecto visual mejorado
    const element = event.target as HTMLElement;
    if (element) {
      element.classList.add('dragging');
      element.style.transform = 'rotate(5deg)';
    }
    
    // Configurar datos para el transfer
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', card.id);
      event.dataTransfer.effectAllowed = 'move';
      
      // Crear imagen personalizada para el drag
      const dragImage = element.cloneNode(true) as HTMLElement;
      dragImage.style.transform = 'rotate(5deg)';
      dragImage.style.opacity = '0.8';
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 75, 25);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  }

  onDragEnd(event: DragEvent) {
    // Restaurar estilos
    const element = event.target as HTMLElement;
    if (element) {
      element.classList.remove('dragging');
      element.style.transform = '';
      element.style.opacity = '';
    }
    
    // Limpiar efectos de todas las listas
    document.querySelectorAll('.list-cards').forEach(container => {
      container.classList.remove('drag-over');
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    
    // Agregar efecto visual al área de drop
    const container = event.currentTarget as HTMLElement;
    container.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent) {
    // Solo remover el efecto si realmente salimos del contenedor
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      container.classList.remove('drag-over');
    }
  }

  onDrop(event: DragEvent, targetListId: string) {
    event.preventDefault();
    
    // Remover efecto visual
    const container = event.currentTarget as HTMLElement;
    container.classList.remove('drag-over');
    
    if (!this.draggedCard) return;
    
    const card = this.draggedCard;
    const fromListId = this.draggedFromListId;
    const toListId = targetListId;
    
    // Calcular posición de inserción basada en la posición del mouse
    const dropPosition = this.calculateDropPosition(event, container);
    
    // Mover la tarjeta
    this.moveCardToPosition(card, fromListId, toListId, dropPosition);
    
    // Limpiar variables de drag
    this.draggedCard = null;
    this.draggedFromListId = '';
  }

  private calculateDropPosition(event: DragEvent, container: HTMLElement): number {
    const cards = Array.from(container.querySelectorAll('.card-item'));
    const y = event.clientY;
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const rect = card.getBoundingClientRect();
      const cardMiddle = rect.top + rect.height / 2;
      
      if (y < cardMiddle) {
        return i;
      }
    }
    
    return cards.length;
  }

  private moveCardToPosition(card: Card, fromListId: string, toListId: string, position: number) {
    const fromList = this.lists.find(list => list.id === fromListId);
    const toList = this.lists.find(list => list.id === toListId);
    
    if (fromList && toList) {
      // Remover tarjeta de la lista origen
      const cardIndex = fromList.cards.findIndex(c => c.id === card.id);
      if (cardIndex > -1) {
        fromList.cards.splice(cardIndex, 1);
      }
      
      // Actualizar el listId de la tarjeta
      card.listId = toListId;
      
      // Insertar en la posición específica
      const targetPosition = Math.min(position, toList.cards.length);
      toList.cards.splice(targetPosition, 0, card);
      
      // Recalcular posiciones
      this.updateCardPositions(toList);
      if (fromListId !== toListId) {
        this.updateCardPositions(fromList);
      }
      
      // Mostrar notificación mejorada
      this.showMoveNotification(card, fromList, toList, fromListId === toListId);
    }
  }

  private updateCardPositions(list: List) {
    list.cards.forEach((card, index) => {
      card.position = index + 1;
    });
  }

  private showMoveNotification(card: Card, fromList: List, toList: List, sameList: boolean) {
    if (sameList) {
      console.log(`✅ Tarjeta "${card.title}" reordenada en "${toList.title}"`);
    } else {
      console.log(`🎯 Tarjeta "${card.title}" movida de "${fromList.title}" a "${toList.title}"`);
    }
  }

  // Utility methods
  getPriorityIcon(priority?: string): string {
    if (!priority) return '';
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '';
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  formatDate(date: string): string {
    if (!date) return '';
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays < 0) return `${Math.abs(diffDays)} días atrás`;
    return `${diffDays} días`;
  }

  getDueDateClass(dueDate: string): string {
    if (!dueDate) return '';
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due-today';
    if (diffDays <= 2) return 'due-soon';
    return '';
  }

  getBoardStats() {
    const totalCards = this.lists.reduce((total, list) => total + list.cards.length, 0);
    const assignedCards = this.lists.reduce((total, list) => 
      total + list.cards.filter(card => card.assignedTo).length, 0);
    
    return {
      lists: this.lists.length,
      cards: totalCards,
      assignedCards: assignedCards
    };
  }

  canDeleteBoard(): boolean {
    return this.getBoardStats().assignedCards === 0;
  }
}
