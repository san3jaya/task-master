const vscode = require("vscode");

class TaskTreeDataProvider {
  constructor(taskProvider) {
    this.taskProvider = taskProvider;
  }

  getTreeItem(element) {
    if (element.collapsibleState !== undefined) {
      return new vscode.TreeItem(element.label, element.collapsibleState);
    }

    const treeItem = new vscode.TreeItem(
      element.label,
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
      Completed: new vscode.ThemeColor("charts.green"),
    };

    treeItem.iconPath = new vscode.ThemeIcon(
      "circle-filled",
      element.completed
        ? priorityColors["Completed"]
        : priorityColors[element.priority]
    );

    treeItem.description = `${element.priority}${
      element.dueDate ? ` | Due: ${element.dueDate}` : ""
    }`;
    treeItem.tooltip = new vscode.MarkdownString(
      `**${element.label}**\n\nPriority: ${element.priority}\nStatus: ${
        element.completed ? "Completed" : "To Do"
      }${element.dueDate ? `\nDue Date: ${element.dueDate}` : ""}`
    );

    return treeItem;
  }

  getChildren(element) {
    if (!element) {
      return [
        {
          label: "To Do",
          collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        },
        {
          label: "Completed",
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        },
      ];
    } else {
      return this.taskProvider.getFilteredAndSortedTasks(element.label);
    }
  }

  get onDidChangeTreeData() {
    return this.taskProvider.onDidChangeTreeData;
  }
}

module.exports = TaskTreeDataProvider;
