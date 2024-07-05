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

    this.checkedIcon = {
      light: this.context.asAbsolutePath(
        path.join("images", "checked-light.svg")
      ),
      dark: this.context.asAbsolutePath(
        path.join("images", "checked-dark.svg")
      ),
    };
    this.uncheckedIcon = {
      light: this.context.asAbsolutePath(
        path.join("images", "unchecked-light.svg")
      ),
      dark: this.context.asAbsolutePath(
        path.join("images", "unchecked-dark.svg")
      ),
    };
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
      return [
        new TaskGroup("To Do", vscode.TreeItemCollapsibleState.Expanded),
        new TaskGroup("Completed", vscode.TreeItemCollapsibleState.Expanded),
      ];
    } else if (element instanceof TaskGroup) {
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
      `${element.label}`,
      vscode.TreeItemCollapsibleState.None
    );
    treeItem.contextValue = "task";
    treeItem.command = {
      command: "taskMaster.toggleTaskCompletion",
      title: "Toggle Task Completion",
      arguments: [element],
    };

    treeItem.iconPath = element.completed
      ? this.checkedIcon
      : this.uncheckedIcon;

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
