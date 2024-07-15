const vscode = require("vscode");
const TaskProvider = require("./taskProvider");

function activate(context) {
  const taskProvider = new TaskProvider(context);
  vscode.window.registerTreeDataProvider("tasksView", taskProvider);

  // Add Task Command
  let addDisposable = vscode.commands.registerCommand(
    "taskMaster.addTask",
    async function () {
      const taskName = await vscode.window.showInputBox({
        placeHolder: "Enter task name",
        prompt: "Add a new task",
      });
      if (taskName) {
        const priority = await vscode.window.showQuickPick(
          ["Low", "Medium", "High"],
          {
            placeHolder: "Select task priority",
          }
        );
        const dueDate = await vscode.window.showInputBox({
          placeHolder: "YYYY-MM-DD",
          prompt: "Enter due date (optional)",
        });
        const task = {
          label: taskName,
          completed: false,
          priority: priority || "Medium",
          dueDate: dueDate || null,
        };
        taskProvider.addTask(task);
      }
    }
  );

  // Update Task Command
  let updateDisposable = vscode.commands.registerCommand(
    "taskMaster.updateTask",
    async function (task) {
      if (task) {
        const updatedName = await vscode.window.showInputBox({
          value: task.label,
          prompt: "Update task name",
        });
        if (updatedName !== undefined) {
          const updatedPriority = await vscode.window.showQuickPick(
            ["Low", "Medium", "High"],
            {
              placeHolder: "Update task priority",
            }
          );
          const updatedDueDate = await vscode.window.showInputBox({
            value: task.dueDate,
            placeHolder: "YYYY-MM-DD",
            prompt: "Update due date (optional)",
          });
          taskProvider.updateTask(
            task,
            updatedName,
            updatedPriority,
            updatedDueDate
          );
        }
      }
    }
  );

  let deleteDisposable = vscode.commands.registerCommand(
    "taskMaster.deleteTask",
    function (task) {
      if (task) {
        taskProvider.deleteTask(task);
      }
    }
  );

  // Toggle Task Completion Command
  let toggleDisposable = vscode.commands.registerCommand(
    "taskMaster.toggleTaskCompletion",
    function (task) {
      if (task) {
        taskProvider.toggleTaskCompletion(task);
      }
    }
  );

  // Filter Tasks Command
  let filterDisposable = vscode.commands.registerCommand(
    "taskMaster.filterTasks",
    async function () {
      const filter = await vscode.window.showQuickPick(
        ["All", "To Do", "Completed", "High Priority", "Due Soon"],
        {
          placeHolder: "Filter tasks",
        }
      );
      if (filter) {
        taskProvider.setFilter(filter);
      }
    }
  );

  // Sort Tasks Command
  let sortDisposable = vscode.commands.registerCommand(
    "taskMaster.sortTasks",
    async function () {
      const sortBy = await vscode.window.showQuickPick(
        ["Name", "Priority", "Due Date"],
        {
          placeHolder: "Sort tasks by",
        }
      );
      if (sortBy) {
        taskProvider.setSortBy(sortBy);
      }
    }
  );

  context.subscriptions.push(
    addDisposable,
    updateDisposable,
    deleteDisposable,
    toggleDisposable,
    filterDisposable,
    sortDisposable
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
