import { Router } from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

router.get("/", (req, res) => {
	res.sendFile(join(__dirname, "..", "public", "index.html"));
});

router.get("/test-agents", (req, res) => {
	res.sendFile(join(__dirname, "..", "public", "test-agents.html"));
});

router.get("/simulate", (req, res) => {
	res.sendFile(join(__dirname, "..", "public", "simulate.html"));
});

router.get("/history", (req, res) => {
	res.sendFile(join(__dirname, "..", "public", "history.html"));
});

router.get("/self-improve", (req, res) => {
	res.sendFile(join(__dirname, "..", "public", "self-improve.html"));
});

export default router;