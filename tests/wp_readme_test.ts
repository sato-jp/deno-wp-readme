import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import {
  wpReadmeConvertString,
  wpReadmeFind,
  wpReadmeVisibility,
} from "../wp-readme.ts";

Deno.test("wpReadmeFind - finds README.md in document directory", async () => {
  const testDir = join(Deno.cwd(), "tests", "document");
  const path = await wpReadmeFind(testDir);
  assertEquals(path, join(testDir, "README.md"));
});

Deno.test("wpReadmeFind - returns empty string for non-existent directory", async () => {
  const path = await wpReadmeFind(join(Deno.cwd(), "tests", "not_exists"));
  assertEquals(path, "");
});

Deno.test("wpReadmeVisibility - removes github-only comments", () => {
  const input = `<!-- only:github/ -->
This text should be removed
<!-- /only:github -->
Only this.
<!-- only:github/ -->
This text should be removed
<!-- /only:github -->`;
  const result = wpReadmeVisibility(input);
  assertEquals(result.trim(), "Only this.");
});

Deno.test("wpReadmeVisibility - reveals WordPress-only comments", () => {
  const input = `<!-- only:wp>
This section will be revealed.
</only:wp -->`;
  const expected = "This section will be revealed.";
  const result = wpReadmeVisibility(input);
  assertEquals(result.trim(), expected);
});

Deno.test("wpReadmeVisibility - handles environment variables", () => {
  Deno.env.set("WP_README_ENV", "production");
  const input = `<!-- only:production>
This section will be revealed.
</only:production -->
<!-- not:production/ -->
This text should be removed
<!-- /not:production -->`;
  const expected = "This section will be revealed.";
  const result = wpReadmeVisibility(input);
  assertEquals(result.trim(), expected);
  Deno.env.delete("WP_README_ENV");
});

Deno.test("wpReadmeVisibility - handles different environment", () => {
  Deno.env.set("WP_README_ENV", "development");
  const input = `<!-- only:development>
This section will be revealed.
</only:development -->`;
  const expected = "This section will be revealed.";
  const result = wpReadmeVisibility(input);
  assertEquals(result.trim(), expected);
  Deno.env.delete("WP_README_ENV");
});

Deno.test("wpReadmeConvertString - converts headers correctly", () => {
  const input = `# Title
## Subtitle
### Sub-subtitle`;
  const result = wpReadmeConvertString(input);
  assertEquals(
    result,
    `=== Title ===
== Subtitle ==
= Sub-subtitle =`,
  );
});

Deno.test("wpReadmeConvertString - converts code blocks", () => {
  const input = "```\nfunction test() {\n  return 'test';\n}\n```";
  const result = wpReadmeConvertString(input);
  assertEquals(result, "<pre>function test() {\n  return 'test';\n}</pre>");
});

Deno.test("wpReadmeConvertString - full conversion test", async () => {
  const testDir = join(Deno.cwd(), "tests", "document");
  const readmePath = join(testDir, "README.md");
  const expectedPath = join(testDir, "readme-sample.txt");

  const readmeContent = await Deno.readTextFile(readmePath);
  const expectedContent = await Deno.readTextFile(expectedPath);

  const converted = wpReadmeConvertString(readmeContent);

  // Compare line by line, ignoring whitespace differences
  const convertedLines = converted.split("\n").map((l) => l.trimEnd());
  const expectedLines = expectedContent.split("\n").map((l) => l.trimEnd());

  assertEquals(convertedLines.length, expectedLines.length);
  for (let i = 0; i < convertedLines.length; i++) {
    assertEquals(convertedLines[i], expectedLines[i], `Line ${i + 1} mismatch`);
  }
});
