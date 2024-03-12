import fs from 'fs';
import path from 'path';
import { handleFileUpload, getExistingFilenames, getDate, getUploadPath } from "@/components/functions/primary";

const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || typeof content !== 'string') {
            return res.status(400).json({ error: "Content is required and must be a string" });
        }

        // Validate file upload
        if (!req.file || !req.file.filename) {
            return res.status(400).json({ error: "File upload is required" });
        }

        const existingFilenames = await getExistingFilenames();

        let nextFilename = "0.json";
        if (existingFilenames.length > 0) {
            const lastFilename = existingFilenames[existingFilenames.length - 1];
            const lastFileIndex = parseInt(lastFilename.split(".")[0]);
            nextFilename = `${lastFileIndex + 1}.json`;
        }

        const filePath = path.join(process.cwd(), "src", "database", "posts", nextFilename);

        const newPost = {
            id: existingFilenames.length, 
            file: getUploadPath(req.file).replace(/^public\//, '') + '/' + req.file.filename,
            date: getDate(),
            content,
        };

        await fs.promises.writeFile(filePath, JSON.stringify(newPost));

        return res.status(200).json({ message: "Post created successfully" });
    } catch (error) {
        return res.status(500).json({ error: `Sorry, something happened: ${error.message}` });
    }
};

export const config = { api: { bodyParser: false } };

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    handleFileUpload(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: "Error uploading file" });
        }
        createPost(req, res);
    });
}
