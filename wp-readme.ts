/**
 * Generate readme.txt from GitHub's README.md
 *
 * Deno/TypeScript port of wp-readme
 * @version 2.0.5
 * @see https://github.com/fumikito/wp-readme (original PHP version)
 */

import { basename, dirname, join } from "@std/path";

/**
 * Find readme and return file path.
 *
 * @param targetDir
 * @returns file path or empty string
 */
export async function wpReadmeFind(targetDir: string = "."): Promise<string> {
	targetDir = targetDir.replace(/[/\\]$/, "");

	try {
		const entries = Deno.readDir(targetDir);
		for await (const entry of entries) {
			if (
				entry.isFile &&
				(entry.name === "readme.md" || entry.name === "README.md")
			) {
				return join(targetDir, entry.name);
			}
		}
	} catch (_error) {
		// Directory doesn't exist or can't be read
		return "";
	}

	return "";
}

/**
 * Convert and save readme file.
 *
 * @param targetFile
 * @returns true if successful
 * @throws Error
 */
export async function wpReadmeReplace(targetFile: string): Promise<boolean> {
	// Check if file exists
	try {
		await Deno.stat(targetFile);
	} catch {
		throw new Error("File not found.");
	}

	// Check if directory is writable
	const targetDir = dirname(await Deno.realPath(targetFile));
	try {
		const stat = await Deno.stat(targetDir);
		if (!stat.isDirectory) {
			throw new Error("Target directory is not writable.");
		}
	} catch {
		throw new Error("Target directory is not writable.");
	}

	// Generate output file path
	const newFileName = basename(targetFile).toLowerCase().replace(
		/\.md$/u,
		".txt",
	);
	const newFile = join(targetDir, newFileName);

	// Check if output file exists and is writable
	try {
		const stat = await Deno.stat(newFile);
		if (stat.isFile) {
			// File exists, check if writable
			try {
				await Deno.writeTextFile(newFile, "");
			} catch {
				throw new Error("readme.txt already exists and is not writable.");
			}
		}
	} catch (error) {
		if (error instanceof Error && error.message.includes("already exists")) {
			throw error;
		}
		// File doesn't exist, which is fine
	}

	// Read and convert file
	const string = await Deno.readTextFile(targetFile);
	const converted = wpReadmeConvertString(string);

	// Save file
	try {
		await Deno.writeTextFile(newFile, converted);
	} catch {
		throw new Error("Failed to save readme.txt");
	}

	return true;
}

/**
 * Convert readme string.
 *
 * @param string
 * @returns converted string
 */
export function wpReadmeConvertString(string: string): string {
	// Control visibility.
	string = wpReadmeVisibility(string);

	// Replace headers.
	string = string.replace(/^(#+)\s+(.*)$/gmu, (_match, hashes, text) => {
		const length = hashes.length;
		const sepLength = 3 - (length - 1);
		const sep = "=".repeat(sepLength);
		return `${sep} ${text} ${sep}`;
	});

	// Format code.
	string = string.replace(
		/```([^\n`]*?)\n(.*?)\n```/gus,
		(_match, _lang, code) => {
			return `<pre>${code}</pre>`;
		},
	);

	return string;
}

/**
 * Convert visibility.
 *
 * @param string
 * @returns converted string
 */
export function wpReadmeVisibility(string: string): string {
	// Remove github comment
	string = string.replace(
		/<!-- only:github\/ -->(.*?)<!-- \/only:github -->/gus,
		"",
	);

	// Display WordPress comment.
	string = string.replace(
		/<!-- only:wp>(.*?)<\/only:wp -->/gus,
		(_match, content) => {
			return content.trim();
		},
	);

	// Handle env variable.
	const env = Deno.env.get("WP_README_ENV");
	if (env) {
		// Handle <!-- only:env>...</only:env -->
		const onlyPattern = new RegExp(
			`<!-- only:${env}>(.*?)<\\/only:${env} -->`,
			"gus",
		);
		string = string.replace(onlyPattern, (_match, content) => {
			return content.trim();
		});

		// Handle <!-- not:env/ -->...</not:env -->
		string = string.replace(
			/<!-- not:([^/]+)\/ -->(.*?)<!-- \/not:[^ ]+ -->/gus,
			(_match, envName, content) => {
				if (env === envName) {
					return "";
				} else {
					return content.trim();
				}
			},
		);
	}

	return string;
}

// This file is executed as main routine.
if (import.meta.main) {
	const targetDir = Deno.env.get("WP_README_DIR") || ".";
	const file = await wpReadmeFind(targetDir);

	try {
		// File not found.
		if (!file) {
			throw new Error("No README.md in current directory.");
		}
		console.log("readme.md found...");
		if (await wpReadmeReplace(file)) {
			console.log("readme.txt generated successfully!");
		}
	} catch (error) {
		console.error(
			"[ERROR]",
			error instanceof Error ? error.message : String(error),
		);
		Deno.exit(1);
	}
}
