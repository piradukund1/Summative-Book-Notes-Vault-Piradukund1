# Book & Notes Vault

## 1. Overview

**Chosen theme:** Book and Note Management.

Book & Notes Vault is a web application that helps users organize books, manage notes, search records, and track reading progress.

## Links
 - Repository: https://github.com/piradukund1/Summative-Book-Notes-Vault-Piradukund1
 - GitHub Pages (live link): https://piradukund1.github.io/Summative-Book-Notes-Vault-Piradukund1/
 - Demo Video: https://drive.google.com/file/d/1zAn-rt1jbHSpfQ9oAZLaBgEVMcTMO10Q/view?pli=1

## 2. Features

- Add, view, edit, and delete book records.
- Search books using regular expressions (Regex).
- Sort and filter records.
- Track reading statistics and page targets.
- Import and export saved data.
- Store records using browser local storage.
- Responsive layout for different screen sizes.

## 3. Regex Catalog

| Pattern | Example | Purpose |
|---|---|---|
| `JavaScript` | `JavaScript Basics` | Matches text containing JavaScript. |
| `^The` | `The Great Book` | Matches text starting with “The”. |
| `book$` | `My book` | Matches text ending with “book”. |
| `^.{5}$` | `Hello` | Matches text containing exactly five characters. |
| `[abc]` | `apple` | Matches text containing `a`, `b`, or `c`. |
| `[` | Invalid pattern | Tests how invalid regex input is handled. |

*Note: Regex matching behavior depends on how the application implements its search.*

## 4. Keyboard Map

| Key | Action |
|---|---|
| `Tab` | Move to the next interactive element. |
| `Shift + Tab` | Move to the previous element. |
| `Enter` | Activate links and buttons. |
| `Space` | Activate buttons or toggle checkboxes when focused. |
| `Esc` | Close dialogs, if supported. |

## 5. Accessibility Notes

- Use semantic HTML elements for page structure.
- Provide labels for form fields.
- Ensure interactive elements are keyboard accessible.
- Maintain readable text and sufficient color contrast.
- Display clear validation and error messages.
- Use visible focus indicators for keyboard navigation.

## 6. How to Run

1. Download or extract the project files.
2. Open the project folder in Visual Studio Code.
3. Start **Live Server** and open `index.html`.
4. Navigate through the pages and test the features.

## 7. Running Tests

1. Start the project using Live Server.
2. Open `tests.html` in the browser, if included in the project.
3. Run the available tests and check the results.
4. Test book management, regex search, import/export, and keyboard navigation.

## 8. Design

The app uses a clean dashboard design with a sidebar for navigation. It focuses on making book management simple and easy.

The layout is designed for:

1.Mobile screens

2.Tablet screens

3.Desktop screens

## 9. Project files

index.html contains the main page.

styles/style.css contains the page styles.

scripts/app.js handles user actions.

scripts/ui.js displays records and statistics.

scripts/state.js handles application state.

scripts/storage.js saves and loads data.

scripts/search.js handles regex search.

scripts/validators.js validates user input.

tests.html runs automated tests, if included.

## Author

Created by Philbert.

## About

Book & Notes Vault is a project focused on making it easier to organize books, manage notes, and monitor reading progress.
