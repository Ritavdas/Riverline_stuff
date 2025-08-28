import { promises as fs } from "fs";

export async function readJsonFile(filePath) {
	try {
		const data = await fs.readFile(filePath, "utf8");
		return JSON.parse(data);
	} catch (error) {
		console.error(`Error reading ${filePath}:`, error);
		return null;
	}
}

export async function writeJsonFile(filePath, data) {
	try {
		await fs.writeFile(filePath, JSON.stringify(data, null, 2));
		return true;
	} catch (error) {
		console.error(`Error writing ${filePath}:`, error);
		return false;
	}
}