const vscode = require("vscode");

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
      // Root of the tree
      return [
        new TaskGroup("To Do", vscode.TreeItemCollapsibleState.Expanded),
        new TaskGroup("Completed", vscode.TreeItemCollapsibleState.Expanded),
      ];
    } else if (element instanceof TaskGroup) {
      // Inside a group
      return this.tasks.filter(
        (task) =>
          (element.label === "To Do" && !task.completed) ||
          (element.label === "Completed" && task.completed)
      );
    }
  }

  getTreeItem(element) {
    if (element instanceof TaskGroup) {
      return element;
    }

    let treeItem = new vscode.TreeItem(
      `${element.completed ? "☑" : "☐"} ${element.label} -- ${
        element.category
      }`,
      vscode.TreeItemCollapsibleState.None
    );
    treeItem.contextValue = "task";
    treeItem.command = {
      command: "taskMaster.toggleTaskCompletion",
      title: "Toggle Task Completion",
      arguments: [element],
    };
    return treeItem;
  }

  addTask(taskItem) {
    this.tasks.push(taskItem);
    this.saveTasks();
    this._onDidChangeTreeData.fire();
  }

  updateTask(task) {
    vscode.window
      .showInputBox({ placeHolder: "Update task", value: task.label })
      .then((value) => {
        if (value && this.tasks.indexOf(task) !== -1) {
          task.label = value;
          this.saveTasks();
          this._onDidChangeTreeData.fire();
        }
      });
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
