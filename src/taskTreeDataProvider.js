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
      this.truncateLabel(element.label),
      vscode.TreeItemCollapsibleState.None
    );
    treeItem.contextValue = "task";
    treeItem.command = {
      command: "devTasks.toggleTaskCompletion",
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

    // Create a detailed tooltip
    treeItem.tooltip = new vscode.MarkdownString(this.createTooltip(element));

    return treeItem;
  }

  truncateLabel(label) {
    return label.length > 20 ? label.substring(0, 17) + "..." : label;
  }

  createTooltip(element) {
    let tooltip = `**${element.label}**\n\n`;
    tooltip += `Priority: ${element.priority}\n`;
    tooltip += `Status: ${element.completed ? "Completed" : "To Do"}\n`;
    if (element.dueDate) {
      tooltip += `Due Date: ${element.dueDate}\n`;
    }
    return tooltip;
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
