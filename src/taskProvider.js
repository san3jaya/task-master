const vscode = require("vscode");

class TaskProvider {
  constructor(context) {
    this.context = context;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.tasks = this.loadTasks();
    this.filter = "All";
    this.sortBy = "Name";
  }

  loadTasks() {
    const storageScope = vscode.workspace
      .getConfiguration("taskMaster")
      .get("storageScope");
    return storageScope === "workspace"
      ? this.context.workspaceState.get("tasks", [])
      : this.context.globalState.get("tasks", []);
  }

  saveTasks() {
    const storageScope = vscode.workspace
      .getConfiguration("taskMaster")
      .get("storageScope");
    const storage =
      storageScope === "workspace"
        ? this.context.workspaceState
        : this.context.globalState;
    storage.update("tasks", this.tasks);
  }

  async addTask() {
    const taskName = await vscode.window.showInputBox({
      placeHolder: "Enter task name",
      prompt: "Add a new task",
    });
    if (!taskName) return;

    const priority = await vscode.window.showQuickPick(
      ["Low", "Medium", "High"],
      { placeHolder: "Select task priority" }
    );
    const dueDate = await vscode.window.showInputBox({
      placeHolder: "YYYY-MM-DD",
      prompt: "Enter due date (optional)",
    });

    this.tasks.push({
      label: taskName,
      completed: false,
      priority: priority || "Medium",
      dueDate: dueDate || null,
    });

    this.saveTasks();
    this._onDidChangeTreeData.fire();
  }

  async updateTask(task) {
    if (!task) return;

    const updatedName = await vscode.window.showInputBox({
      value: task.label,
      prompt: "Update task name",
    });
    if (updatedName === undefined) return;

    const updatedPriority = await vscode.window.showQuickPick(
      ["Low", "Medium", "High"],
      { placeHolder: "Update task priority" }
    );
    const updatedDueDate = await vscode.window.showInputBox({
      value: task.dueDate,
      placeHolder: "YYYY-MM-DD",
      prompt: "Update due date (optional)",
    });

    const index = this.tasks.findIndex((t) => t === task);
    if (index !== -1) {
      const wasCompleted = this.tasks[index].completed;
      this.tasks[index] = {
        ...this.tasks[index],
        label: updatedName,
        priority: updatedPriority,
        dueDate: updatedDueDate,
        completed: false,
      };

      vscode.window.showInformationMessage(
        `Task "${updatedName}" has been updated${
          wasCompleted ? " and moved back to To Do" : ""
        }.`
      );

      this.saveTasks();
      this._onDidChangeTreeData.fire();
    }
  }

  async deleteTask(task) {
    if (!task) return;

    const answer = await vscode.window.showInformationMessage(
      `Are you sure you want to delete "${task.label}"?`,
      "Yes",
      "No"
    );

    if (answer === "Yes") {
      this.tasks = this.tasks.filter((t) => t !== task);
      this.saveTasks();
      this._onDidChangeTreeData.fire();
    }
  }

  toggleTaskCompletion(task) {
    if (!task) return;

    const index = this.tasks.findIndex((t) => t === task);
    if (index !== -1) {
      this.tasks[index].completed = !this.tasks[index].completed;
      this.saveTasks();
      this._onDidChangeTreeData.fire();
    }
  }

  async filterTasks() {
    const filter = await vscode.window.showQuickPick(
      ["All", "To Do", "Completed", "High Priority", "Due Soon"],
      { placeHolder: "Filter tasks" }
    );

    if (filter) {
      this.filter = filter;
      this._onDidChangeTreeData.fire();
    }
  }

  async sortTasks() {
    const sortBy = await vscode.window.showQuickPick(
      ["Name", "Priority", "Due Date"],
      { placeHolder: "Sort tasks by" }
    );

    if (sortBy) {
      this.sortBy = sortBy;
      this._onDidChangeTreeData.fire();
    }
  }

  getFilteredAndSortedTasks(group) {
    let filteredTasks = this.tasks.filter((task) => {
      if (group === "To Do" && task.completed) return false;
      if (group === "Completed" && !task.completed) return false;

      switch (this.filter) {
        case "All":
          return true;
        case "To Do":
          return !task.completed;
        case "Completed":
          return task.completed;
        case "High Priority":
          return task.priority === "High";
        case "Due Soon":
          return this.isDueSoon(task);
        default:
          return true;
      }
    });

    return this.applySorting(filteredTasks);
  }

  isDueSoon(task) {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  applySorting(tasks) {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    return tasks.sort((a, b) => {
      switch (this.sortBy) {
        case "Name":
          return a.label.localeCompare(b.label);
        case "Priority":
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "Due Date":
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        default:
          return 0;
      }
    });
  }
}

module.exports = TaskProvider;
