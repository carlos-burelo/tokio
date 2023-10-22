# Tokio - A Simplified Backend Framework for API Development

![Tokio Logo](https://example.com/tokio-logo.png)

Tokio is a lightweight backend framework designed to streamline API development by leveraging the file system to create endpoints. With Tokio, you can easily organize your API routes as folders and files, making the process of building APIs more intuitive and efficient. This README will guide you through the installation process, demonstrate how to use the framework, highlight its advantages over traditional approaches like Express, provide code examples, and explain how to contribute to the project.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Advantages over Traditional Frameworks](#advantages-over-traditional-frameworks)
- [Examples](#examples)
- [Contribution](#contribution)
- [License](#license)

## Installation

To get started with Tokio, follow these simple steps:

1. Install the package from npm:

```bash
npm install @coatl/tokio
```

1. Create your API endpoints as folders and files inside a designated directory, e.g., `api`.

2. Export the desired HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD) as functions from the files that represent the respective routes.

3. Build and run the router using the main entry file, for example, `main.ts`:

```typescript
import { Tokio } from "@coatl/tokio";
const server = new Tokio({
  apiPath: "./api",
  root: import.meta.url,
  port: 4000,
});
await server.run();
// server listening on http://localhost:4000 🚀
```

## Usage

With Tokio, API development becomes incredibly straightforward. Instead of dealing with complex configurations and boilerplate code, you only need to focus on writing the methods for each HTTP verb that your API requires. The framework will take care of the rest, allowing you to concentrate on building the actual functionality.

### Creating API Endpoints

To create an API endpoint, follow this folder and file naming convention:

- Place your route files inside a folder named `routes` or `api`.
- Use `index.ts` or `index.js` inside the folder as the primary router file.
- For dynamic routes, use the notation `[param].ts` inside the folder, where `[param]` represents the parameter name.

For example, consider the following folder structure:

```powershell
api/
├── users/
│   ├── index.ts        // Handles /users/
│   ├── [name].ts       // Handles /users/[name]
│   └── [name]/
│       └── index.ts    // This path overwrites to the previous one by specificity
```

### Handling HTTP Methods

To handle different HTTP methods for each route, create and export functions with the corresponding method names in the route files.

If a function does not return a valid data type (`string`, `number`, `boolean`, `object`, `array`) then it must be processed with the methods of the `res` object in order to return a response to the client

```ts
// Example: Handling GET method for /
export function GET(_, res) {
  return res.text("Hello World!");
}
```

in case it returns any value of the above, then they will be processed according to their data type, for example: object and array will be sent with the header: `'Content-Type': 'application/json'` and the others will be sent with the header `'Content-Type': 'text/plain'`

```ts
// Example: Handling GET method for /ping
export function POST(req, res) {
  return res.json({ message: "pong" });
}
```

### Accessing Request Parameters

You can access dynamic parameters passed in the URL through the req.params() object in the route's method functions.

```ts
// Example: Accessing the 'name' parameter for /users/[name]
export function GET(req, res) {
  const { name } = req.params();
  return res.text(`Hello, ${name}!`);
}
```

## Advantages over Traditional Frameworks

Tokio provides several advantages over traditional backend frameworks like Express:

1. **Simplified Code Structure**: With Tokio, you can build APIs using a minimalistic approach, reducing boilerplate code and improving code readability.
2. **Organized File-Based Routing**: The file system-based approach of Tokio allows for better organization of API endpoints, making it easier to manage and navigate through routes.
3. **Dynamic Routing**: Tokio natively supports dynamic routing, enabling you to handle parameters in URLs effortlessly.
4. **Ease of Use**: Developers can focus solely on writing the functionality for each API route without worrying about complex configurations.
5. **Lightweight**: Tokio is designed to be lightweight, ensuring optimal performance and efficient resource utilization.
6. **Easy Learning Curve**: The simplicity of Tokio makes it a great choice for both beginners and experienced developers, accelerating the API development process.

## Examples

Here are a few code examples to demonstrate how Tokio simplifies API development:

```ts
// File: api/users/index.ts

// Handling GET method for /users/
export function GET(req, res) {
  // Your code to fetch all users
}

// Handling POST method for /users/
export function POST(req, res) {
  // Your code to create a new user
}
```

```ts
// File: api/users/[name].ts

// Handling GET method for /users/[name]
export function GET(req, res) {
  const { name } = req.params();
  // Your code to fetch user by name
  return res.json({ user });
}
```

## Contribution

Contributions to Tokio are welcome! If you'd like to contribute, please follow these steps:

1. Fork the repository on GitHub.
2. Clone your forked repository and create a new branch for your changes.
3. Make your desired changes and additions.
4. Commit and push your changes to your fork.
5. Submit a pull request to the main repository, explaining your changes and the problem they solve.

We appreciate any contributions to make Tokio even better!

## License

Tokio is open-source software licensed under the [GNU General Public License (GPL).](https://www.gnu.org/licenses/gpl-3.0.en.html) Feel free to use, modify, and distribute this framework as per the terms of the GPL. See the LICENSE file for more details.

Thank you for choosing Tokio for your backend API development! We hope this framework simplifies the way you build APIs and makes the development process more enjoyable. If you encounter any issues or have suggestions for improvements, please don't hesitate to create an issue or reach out to our community. Happy coding!

## TODO

- [ ] Add support for middlewares
- [x] Add support for static files
- [ ] Add support for custom error handling
- [x] Add support for custom http status
- [ ] Test coverage
