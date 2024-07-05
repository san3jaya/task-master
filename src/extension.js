const vscode = require("vscode");
const TaskProvider = require("./taskProvider");

function activate(context) {
  const taskProvider = new TaskProvider(context);
  vscode.window.registerTreeDataProvider("tasksView", taskProvider);

  let addDisposable = vscode.commands.registerCommand(
    "taskMaster.addTask",
    function () {
      vscode.window
        .showInputBox({ placeHolder: "Add a new task" })
        .then((value) => {
          if (!value) {
            vscode.window.showWarningMessage("You must enter a task to add.");
          }
          const task = {
            label: value,
            completed: false,
          };
          taskProvider.addTask(task);
        });
    }
  );

  let updateDisposable = vscode.commands.registerCommand(
    "taskMaster.updateTask",
    function (task) {
      if (task) {
        taskProvider.updateTask(task);
      } else {
        vscode.window.showWarningMessage("You must select a task to update.");
      }
    }
  );

  let deleteDisposable = vscode.commands.registerCommand(
    "taskMaster.deleteTask",
    function (task) {
      if (task) {
        taskProvider.deleteTask(task);
      } else {
        vscode.window.showWarningMessage("You must select a task to delete.");
      }
    }
  );

  let toggleDisposable = vscode.commands.registerCommand(
    "taskMaster.toggleTaskCompletion",
    function (task) {
      if (task) {
        taskProvider.toggleTaskCompletion(task);
      } else {
        vscode.window.showWarningMessage(
          "You must select a task to toggle completion."
        );
      }
    }
  );

  context.subscriptions.push(
    addDisposable,
    updateDisposable,
    deleteDisposable,
    toggleDisposable
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
