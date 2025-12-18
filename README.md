# WP-README (Deno Edition)

Convert a GitHub README.md into a WordPress plugin readme.txt

> **Note**: This is a Deno/TypeScript port of the original [wp-readme](https://github.com/fumikito/wp-readme) project.

## Concept

Many WordPress plugin developers host their code on GitHub.
But [WordPress' official repository](https://wordpress.org/plugins/) hosts plugin file in SVN repos.

| Readme         | WordPress                                                 | GitHub                                                                    |
| -------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| File Extension | .txt                                                      | .md                                                                       |
| Format         | [Markdown](https://daringfireball.net/projects/markdown/) | [GitHub Markdown](https://guides.github.com/features/mastering-markdown/) |

They are almost same, but little bit different.

This Deno/TypeScript script converts GitHub's `README.md` into a WordPress `readme.txt` file.
This allows you to maintain a single source of documentation for both GitHub and WordPress.org, eliminating the need to manage two separate files.

## Requirements

- [Deno](https://deno.land/) 2.6 or higher

## Usage

### Direct execution

```bash
deno run --allow-read --allow-write --allow-env wp-readme.ts
```

### Install as a command

```bash
deno install --allow-read --allow-write --allow-env -n wp-readme wp-readme.ts
wp-readme
```

### Remote execution

```bash
deno run --allow-read --allow-write --allow-env https://raw.githubusercontent.com/your-username/deno-wp-readme/main/wp-readme.ts
```

### GitHub Actions

You can use this in GitHub Actions workflows:

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      - name: Generate readme.txt
        run: deno run --allow-read --allow-write --allow-env wp-readme.ts
```

## Advanced Usage

### Control Visibility

By surrounding sections with special HTML comments, you can control their visibility.

```
<!-- only:github/ -->
This section is visible only on github and will be removed from readme.txt.
<!-- /only:github -->
```

```
<!-- only:wp>
This section is visible only on WordPress.org because it's commented out.
Be careful with comment format.
</only:wp -->
```

If you convert 1 repo to multiple delivery type(e.g. deliver the light version on WordPress.org and the pro version on your site), you can use environment variable `WP_README_ENV`.

```
<!-- only:production>
This section will be revealed only if the environment is 'production'.
</only:production -->
<!-- not:production/ -->
This text should be removed if the environment is 'production'
<!-- /not:production -->
```

In command line, export variable and run this script.

```bash
export WP_README_ENV=production
deno run --allow-read --allow-write --allow-env wp-readme.ts
```

### Custom Directory

You can specify a custom directory using the `WP_README_DIR` environment variable:

```bash
export WP_README_DIR=/path/to/your/plugin
deno run --allow-read --allow-write --allow-env wp-readme.ts
```

## Testing

Run tests with Deno's built-in test runner:

```bash
deno test --allow-read --allow-write --allow-env
```

## Contribution

If you find bugs, please make issues. Any pull requests are welcomed.

## License

MIT License (see [LICENSE](LICENSE) file for details)
