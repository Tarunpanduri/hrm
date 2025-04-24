import { Component, OnInit, Input } from '@angular/core';
import {
  Database,
  ref,
  get,
  set,
  push,
  update,
  onValue
} from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-tasks',
  standalone: false,
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  @Input() cardwidth: string = 'auto';

  currentUser: any;
  employees: any[] = [];
  tasks: any[] = [];
  filteredTasks: any[] = [];
  canAddTask: boolean = false;

  showTaskForm = false;

  taskForm = {
    title: '',
    description: '',
    assignedTo: [] as string[],
    dueDate: ''
  };

  searchTerm: string = '';
  filteredEmployees: any[] = [];
  selectedEmployees: any[] = [];

  // New state for filter and sort
  filterStatus: string = 'all'; // 'all', 'completed', 'pending'
  sortOrder: string = 'asc'; // 'asc' or 'desc'

  constructor(private db: Database, private auth: Auth) {}

  async ngOnInit() {
    const storedEmployee = localStorage.getItem('fbhgkjwruguegi');
    if (storedEmployee) {
      this.currentUser = JSON.parse(storedEmployee);
      const role = this.currentUser.role?.toLowerCase();
      const department = this.currentUser.department?.toLowerCase();
      this.canAddTask =
        role === 'manager' || role === 'team lead' || department === 'management' || department === 'hr';
    } else {
      this.currentUser = {};
      this.canAddTask = false;
    }

    await this.fetchEmployees();
    await this.listenToTasks();
  }

  async fetchEmployees() {
    const empRef = ref(this.db, 'employees');
    const snapshot = await get(empRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      this.employees = Object.values(data);
      this.filteredEmployees = [...this.employees];
    }
  }

  listenToTasks() {
    const taskRef = ref(this.db, 'tasks');
    onValue(taskRef, (snapshot) => {
      const taskData = snapshot.val() || {};
      const allTasks = Object.entries(taskData).map(([key, value]: any) => ({
        id: key,
        ...value
      }));

      this.tasks = this.canAddTask
        ? allTasks
        : allTasks.filter((task) =>
            Array.isArray(task.assignedTo)
              ? task.assignedTo.includes(this.currentUser.emp_id)
              : task.assignedTo === this.currentUser.emp_id
          );

      this.applyFilters();
    });
  }

  applyFilters(): void {
    let tempTasks = [...this.tasks];

    // Filter by completion status
    if (this.filterStatus === 'completed') {
      tempTasks = tempTasks.filter(task => task.completed);
    } else if (this.filterStatus === 'pending') {
      tempTasks = tempTasks.filter(task => !task.completed);
    }

    // Sort by due date
    tempTasks.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    this.filteredTasks = tempTasks;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(term) &&
        !this.selectedEmployees.some((e) => e.emp_id === emp.emp_id)
    );
  }

  selectEmployee(emp: any) {
    if (!this.selectedEmployees.some((e) => e.emp_id === emp.emp_id)) {
      this.selectedEmployees.push(emp);
      this.searchTerm = '';
      this.filteredEmployees = this.employees.filter(
        (e) => !this.selectedEmployees.some((sel) => sel.emp_id === e.emp_id)
      );
    }
  }

  removeSelected(emp: any) {
    this.selectedEmployees = this.selectedEmployees.filter(
      (e) => e.emp_id !== emp.emp_id
    );
    this.onSearchChange(); // Recalculate filtered
  }

  async addTask() {
    const taskRef = ref(this.db, 'tasks');
    const newTaskRef = push(taskRef);

    const taskData = {
      ...this.taskForm,
      assignedTo: this.selectedEmployees.map((e) => e.emp_id),
      assignedBy: this.currentUser.emp_id,
      completed: false,
      completedAt: null,
      department: this.currentUser.department
    };

    await set(newTaskRef, taskData);

    this.showTaskForm = false;
    this.taskForm = {
      title: '',
      description: '',
      assignedTo: [],
      dueDate: ''
    };
    this.searchTerm = '';
    this.selectedEmployees = [];
    this.filteredEmployees = [...this.employees];
  }

  async toggleComplete(task: any) {
    const taskRef = ref(this.db, `tasks/${task.id}`);
    const isCompleted = !task.completed;

    await update(taskRef, {
      completed: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null
    });
  }

  getEmployeeName(empId: string): string {
    const emp = this.employees.find((e) => e.emp_id === empId);
    return emp ? emp.name : empId;
  }

  openTaskForm() {
    this.showTaskForm = true;
    this.filteredEmployees = [...this.employees];
    this.searchTerm = '';
    this.selectedEmployees = [];
  }

  shouldHideTask(task: any): boolean {
    if (!task.completed || !task.completedAt) return false;

    const completedTime = new Date(task.completedAt).getTime();
    const now = new Date().getTime();
    const hoursPassed = (now - completedTime) / (1000 * 60 * 60); // Convert ms to hours

    return hoursPassed >= 72; // Hide after 72 hours
  }
}
