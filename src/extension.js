const vscode = require("vscode");
const TaskProvider = require("./taskProvider");
const TaskTreeDataProvider = require("./taskTreeDataProvider");

function activate(context) {
  const taskProvider = new TaskProvider(context);
  const treeDataProvider = new TaskTreeDataProvider(taskProvider);

  vscode.window.registerTreeDataProvider("tasksView", treeDataProvider);

  const commands = [
    { name: "addTask", method: () => taskProvider.addTask() },
    { name: "updateTask", method: (task) => taskProvider.updateTask(task) },
    { name: "deleteTask", method: (task) => taskProvider.deleteTask(task) },
    {
      name: "toggleTaskCompletion",
      method: (task) => taskProvider.toggleTaskCompletion(task),
    },
    { name: "filterTasks", method: () => taskProvider.filterTasks() },
    { name: "sortTasks", method: () => taskProvider.sortTasks() },
  ];

  commands.forEach(({ name, method }) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(`taskMaster.${name}`, method)
    );
  });
}

function deactivate() {}

module.exports = { activate, deactivate };
