# WP-README (Deno Edition)

Convert a GitHub README.md into a WordPress plugin readme.txt

> **Note**: This is a Deno/TypeScript port of the original [wp-readme](https://github.com/fumikito/wp-readme) project.

## What is this?

When developing WordPress plugins, you use `README.md` on GitHub, but WordPress.org's official repository requires
`readme.txt`. This tool automatically converts GitHub's `README.md` into WordPress's `readme.txt` format.

### Differences

| Item           | WordPress.org                       | GitHub                |
| -------------- | ----------------------------------- | --------------------- |
| File Extension | `.txt`                              | `.md`                 |
| Format         | WordPress-style Markdown            | GitHub-style Markdown |
| Header Format  | `=== Title ===` (uses equals signs) | `# Title` (uses hash) |

By using this tool, you can generate documentation for both GitHub and WordPress.org by **managing just one `README.md`
file**.

## Requirements

- [Deno](https://deno.land/) 2.6 or higher

## Usage

### Quick Start

To convert `README.md` in the current directory to `readme.txt`, run the following command:

```bash
deno run --allow-read --allow-write --allow-env jsr:@pixelium/wp-readme
```

This command searches for `README.md` in the current directory and generates `readme.txt` in the same directory.

### Using as a module

You can import this module from other Deno projects and use it in your programs.

#### Method 1: Add with deno add (Recommended)

To add it as a project dependency:

```bash
deno add jsr:@pixelium/wp-readme
```

This automatically adds the import to `deno.json`:

```json
{
	"imports": {
		"@pixelium/wp-readme": "jsr:@pixelium/wp-readme@^2.0.0"
	}
}
```

Use in your code:

```typescript
import { wpReadmeConvertString, wpReadmeFind, wpReadmeReplace, wpReadmeVisibility } from "@pixelium/wp-readme";

// Find and convert README.md
const readmePath = await wpReadmeFind(".");
if (readmePath) {
	await wpReadmeReplace(readmePath);
	console.log("readme.txt has been generated!");
}
```

#### Method 2: Direct import

To import directly without using `deno.json`:

```typescript
import { wpReadmeFind, wpReadmeReplace } from "jsr:@pixelium/wp-readme";

// Example usage
const readmePath = await wpReadmeFind("./my-plugin");
if (readmePath) {
	await wpReadmeReplace(readmePath);
}
```

### Using with GitHub Actions

To automatically generate `readme.txt` in your CI/CD pipeline:

```yaml
jobs:
    release:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: denoland/setup-deno@v2
              with:
                  deno-version: v2.6.0
            - name: Generate readme.txt
              run: deno run --allow-read --allow-write --allow-env jsr:@pixelium/wp-readme
            - name: Commit readme.txt
              run: |
                  git config user.name "github-actions"
                  git config user.email "github-actions[bot]@users.noreply.github.com"
                  git add readme.txt
                  git commit -m "Update readme.txt" || exit 0
                  git push
```

## Advanced Usage

### Controlling Visibility (Display Different Content on GitHub and WordPress.org)

You can use HTML comments to display different content on GitHub and WordPress.org.

#### GitHub-only Section

Visible in GitHub's `README.md` but removed from WordPress's `readme.txt`:

```markdown
<!-- only:github/ -->

This section is visible only on GitHub.

<!-- /only:github -->
```

#### WordPress-only Section

Visible only in WordPress's `readme.txt` (hidden as a comment on GitHub):

```markdown
<!-- only:wp>
This section is visible only on WordPress.org.
</only:wp -->
```

#### Conditional Branching with Environment Variables

When distributing multiple versions from the same repository (e.g., free version on WordPress.org, pro version on your
site):

```markdown
<!-- only:production>
This section will be revealed only if the environment is 'production'.
</only:production -->

<!-- not:production/ -->

This text should be removed if the environment is 'production'

<!-- /not:production -->
```

Set the environment variable and run:

```bash
export WP_README_ENV=production
deno run --allow-read --allow-write --allow-env jsr:@pixelium/wp-readme
```

### Specifying a Custom Directory

You can specify the directory to search for `README.md` using the `WP_README_DIR` environment variable:

```bash
export WP_README_DIR=/path/to/your/plugin
deno run --allow-read --allow-write --allow-env jsr:@pixelium/wp-readme
```

## Testing

Run tests with Deno's built-in test runner:

```bash
deno test --allow-read --allow-write --allow-env
```

Or use the task:

```bash
deno task test
```

## Contribution

If you find bugs, please create an issue. Pull requests are also welcome.

## License

MIT License (see [LICENSE](LICENSE) file for details)
