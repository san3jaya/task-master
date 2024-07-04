const vscode = require("vscode");
const TaskProvider = require("./taskProvider");
const TASK_CATEGORIES = ["Work", "Personal", "Urgent", "Misc"];

function activate(context) {
  const taskProvider = new TaskProvider(context);
  vscode.window.registerTreeDataProvider("tasksView", taskProvider);

  // Register the command for adding a new task
  let addDisposable = vscode.commands.registerCommand(
    "taskMaster.addTask",
    function () {
      vscode.window
        .showInputBox({ placeHolder: "Add a new task" })
        .then((value) => {
          vscode.window
            .showQuickPick(TASK_CATEGORIES, {
              placeHolder: "Select a category",
            })
            .then((taskCategory) => {
              if (!taskCategory) {
                vscode.window.showWarningMessage("You must select a category.");
                return;
              }
              // Add the task with the collected information
              const task = { label: value, category: taskCategory };
              taskProvider.addTask(task); // Assuming addTask() is already defined to handle such objects
            });
        });
    }
  );

  // Register the command for updating an existing task
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

  // Register the command for deleting an existing task
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

  context.subscriptions.push(addDisposable, updateDisposable, deleteDisposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
