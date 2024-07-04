const vscode = require("vscode");

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

  getChildren() {
    return this.tasks;
  }

  getTreeItem(task) {
    let treeItem = new vscode.TreeItem(
      `${task.label} -- ${task.category}]`,
      vscode.TreeItemCollapsibleState.None
    );
    treeItem.contextValue = "task";
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
}

module.exports = TaskProvider;
