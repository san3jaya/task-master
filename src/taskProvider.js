const vscode = require("vscode");
const path = require("path");

class TaskGroup extends vscode.TreeItem {
  constructor(label, collapsibleState) {
    super(label, collapsibleState);
    this.contextValue = "taskGroup";
  }
}

class TaskProvider {
  constructor(context) {
    this.context = context;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.loadTasks();
    this.filter = "All";
    this.sortBy = "Name";
  }

  setFilter(filter) {
    this.filter = filter;
    this._onDidChangeTreeData.fire();
  }

  setSortBy(sortBy) {
    this.sortBy = sortBy;
    this._onDidChangeTreeData.fire();
  }

  loadTasks() {
    const storageScope = vscode.workspace
      .getConfiguration("taskMaster")
      .get("storageScope");
    const storedTasks =
      storageScope === "workspace"
        ? this.context.workspaceState.get("tasks", [])
        : this.context.globalState.get("tasks", []);
    this.tasks = storedTasks;
  }

  saveTasks() {
    const storageScope = vscode.workspace
      .getConfiguration("taskMaster")
      .get("storageScope");
    if (storageScope === "workspace") {
      this.context.workspaceState.update("tasks", this.tasks);
    } else {
      this.context.globalState.update("tasks", this.tasks);
    }
  }

  getChildren(element) {
    if (!element) {
      return this.getRootItems();
    } else if (element instanceof TaskGroup) {
      return this.getFilteredAndSortedTasks(element.label);
    }
  }

  getRootItems() {
    return [
      new TaskGroup("To Do", vscode.TreeItemCollapsibleState.Expanded),
      new TaskGroup("Completed", vscode.TreeItemCollapsibleState.Collapsed),
    ];
  }

  getFilteredAndSortedTasks(group) {
    let tasks = this.tasks.filter((task) => {
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

    return this.sortTasks(tasks);
  }

  isDueSoon(task) {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  sortTasks(tasks) {
    return tasks.sort((a, b) => {
      switch (this.sortBy) {
        case "Name":
          return a.label.localeCompare(b.label);
        case "Priority":
          const priorityOrder = { High: 0, Medium: 1, Low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "Due Date":
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        default:
          return 0;
      }
    });
  }

  getTreeItem(element) {
    if (element instanceof TaskGroup) {
      return element;
    }

    let treeItem = new vscode.TreeItem(
      `${element.label}`,
      vscode.TreeItemCollapsibleState.None
    );
    treeItem.contextValue = "task";
    treeItem.command = {
      command: "taskMaster.toggleTaskCompletion",
      title: "Toggle Task Completion",
      arguments: [element],
    };

    const priorityColors = {
      High: new vscode.ThemeColor("notificationsErrorIcon.foreground"),
      Medium: new vscode.ThemeColor("notificationsWarningIcon.foreground"),
      Low: new vscode.ThemeColor("notificationsInfoIcon.foreground"),
    };

    let priorityLabel = null;

    if (element.completed) {
      priorityLabel = new vscode.ThemeIcon(
        "circle-filled",
        new vscode.ThemeColor("charts.green")
      );
    } else {
      priorityLabel = new vscode.ThemeIcon(
        "circle-filled",
        priorityColors[element.priority]
      );
    }

    treeItem.iconPath = priorityLabel;

    let description = `${element.priority}`;
    if (element.dueDate) {
      description += ` | Due: ${element.dueDate}`;
    }
    treeItem.description = description;

    treeItem.tooltip = new vscode.MarkdownString(
      `**${element.label}**\n\nPriority: ${element.priority}\nStatus: ${
        element.completed ? "Completed" : "To Do"
      }${element.dueDate ? `\nDue Date: ${element.dueDate}` : ""}`
    );

    return treeItem;
  }

  addTask(taskItem) {
    this.tasks.push(taskItem);
    this.saveTasks();
    this._onDidChangeTreeData.fire();
  }

  updateTask(task, updatedName, updatedPriority, updatedDueDate) {
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

      if (wasCompleted) {
        vscode.window.showInformationMessage(
          `Task "${updatedName}" has been updated and moved back to To Do.`
        );
      } else {
        vscode.window.showInformationMessage(
          `Task "${updatedName}" has been updated.`
        );
      }

      this.saveTasks();
      this._onDidChangeTreeData.fire();
    }
  }

  deleteTask(task) {
    vscode.window
      .showInformationMessage(
        `Are you sure you want to delete "${task.label}"?`,
        ...["Yes", "No"]
      )
      .then((answer) => {
        if (answer === "Yes" && this.tasks.indexOf(task) !== -1) {
          this.tasks = this.tasks.filter((t) => t !== task);
          this.saveTasks();
          this._onDidChangeTreeData.fire();
        }
      });
  }

  toggleTaskCompletion(task) {
    const index = this.tasks.indexOf(task);
    if (index !== -1) {
      this.tasks[index].completed = !this.tasks[index].completed;
      this.saveTasks();
      this._onDidChangeTreeData.fire();
    }
  }
}

module.exports = TaskProvider;
