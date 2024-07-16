# Changelog

All notable changes to the "DevTasks" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-07-16

### Added

- Popup window feature for task items with text longer than 50 characters
- Truncation of long task names in the tree view
- Detailed tooltip for each task item, showing full task name, priority, status, and due date

### Changed

- Updated naming convention from "TaskMaster" to "DevTasks" throughout the codebase
- Refactored command names in extension.js
- Updated configuration names in taskProvider.js
- Modified taskTreeDataProvider.js to implement new popup and truncation features

## [1.0.0] - 2024-07-15

### Added

- Initial release of DevTasks
- Task management functionality (add, update, delete tasks)
- Task priority levels (Low, Medium, High)
- Due date support for tasks
- Task filtering options (All, To Do, Completed, High Priority, Due Soon)
- Task sorting options (Name, Priority, Due Date)
- Configurable storage scope (workspace or global)
- Tree view for organizing tasks into "To Do" and "Completed" categories
- Context menu actions for tasks
- Commands for all major actions
- Configuration option for storage scope

### Changed

- N/A (Initial release)

### Deprecated

- N/A (Initial release)

### Removed

- N/A (Initial release)

### Fixed

- N/A (Initial release)

### Security

- N/A (Initial release)
