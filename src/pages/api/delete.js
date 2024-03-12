import fs, { promises as fsPromises, constants as fsConstants } from "fs";
import path from "path";

export default async function handler(req, res) {
    const { slug } = req.query;
    const jsonFilePath = path.resolve(process.cwd(), "src", "database", "posts", `${slug}.json`);

    try {
        const jsonData = await fsPromises.readFile(jsonFilePath);
        const post = JSON.parse(jsonData);

        const fileExtension = path.extname(post.file).toLowerCase();
        let fileFolder;

        switch (fileExtension) {
            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.gif':
                fileFolder = 'images';
                break;
            case '.mp4':
            case '.avi':
            case '.mov':
                fileFolder = 'videos';
                break;
            case '.mp3':
            case '.wav':
            case '.flac':
                fileFolder = 'audios';
                break;
            case '.doc':
            case '.docx':
            case '.pdf':
            case '.txt':
                fileFolder = 'docs';
                break;
            default:
                fileFolder = 'others';
        }

        const fileDirectory = path.resolve(process.cwd(), "public", "uploads", fileFolder);
        const fileName = path.basename(post.file);
        const fileToDeletePath = path.join(fileDirectory, fileName);
        const jsonFileToDeletePath = jsonFilePath;

        await fsPromises.access(fileToDeletePath, fsConstants.F_OK); // Check if file exists
        await fsPromises.access(jsonFileToDeletePath, fsConstants.F_OK); // Check if JSON file exists

        await fsPromises.unlink(fileToDeletePath); // Delete media file
        await fsPromises.unlink(jsonFileToDeletePath); // Delete JSON file

        res.status(200).json({
            message: `${slug}.json and associated file were deleted successfully`,
        });
    } catch (err) {
        if (err.code === "ENOENT") {
            res.status(404).json({ message: "File not found" });
        } else {
            res.status(500).json({
                message: `Error processing request: ${err.message}`,
            });
        }
    }
}
