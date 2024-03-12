import fs from "fs";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from 'uuid'; // Import uuid to generate unique identifiers

// Function to generate a random unique name
const generateRandomName = (file) => {
    const extname = path.extname(file.originalname);
    return `${uuidv4()}${extname}`;
};

// Function to determine upload path based on file extension
export const getUploadPath = (file) => {
    const extname = path.extname(file.originalname).toLowerCase();
    switch (extname) {
        case ".jpg":
        case ".jpeg":
        case ".png":
        case ".webp":
            return "public/uploads/images";
        case ".mp4":
        case ".avi":
        case ".mov":
            return "public/uploads/videos";
        case ".mp3":
        case ".wav":
        case ".ogg":
            return "public/uploads/audios";
        case ".pdf":
        case ".doc":
        case ".docx":
            return "public/uploads/docs";
        default:
            return "public/uploads/others";
    }
};

// Function to handle file upload
export const handleFileUpload = (req, res, cb) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = getUploadPath(file);
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => cb(null, generateRandomName(file)), // Generate random unique name
    });

    const upload = multer({
        storage,
        fileFilter: function (req, file, cb) {
            const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".avi", ".mov", ".mp3", ".wav", ".ogg", ".pdf", ".doc", ".docx"];
            const extname = path.extname(file.originalname).toLowerCase();
            if (allowedExtensions.includes(extname)) {
                return cb(null, true);
            }
            cb(new Error("Error: File upload only supports the following filetypes - " + allowedExtensions.join(", ")));
        },

    });

    upload.single("file")(req, res, cb);
};

// Function to get existing post filenames
export const getExistingFilenames = () => {
    try {
        return fs.readdirSync(path.join(process.cwd(), "src", "database", "posts"))
            .filter((file) => file !== ".gitkeep");
    } catch (error) {
        throw new Error(`Error reading existing filenames: ${error.message}`);
    }
};

// Function to get date
const currentDate = new Date();
export const getDate = () => {
    return currentDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).replace(/\d+(st|nd|rd|th)/, "$& ");
}