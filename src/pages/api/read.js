import fs from "fs/promises";
import path from "path";

export default async function handler(req, res) {
    try {
        const postsDirectory = path.join(process.cwd(), "src", "database", "posts");
        const fileNames = await fs.readdir(postsDirectory);
        const posts = await Promise.all(fileNames.map(async (fileName) => {
            const filePath = path.join(postsDirectory, fileName);
            const fileContents = await fs.readFile(filePath, "utf8");
            const post = parsePost(fileContents);
            return post;
        }));

        const validPosts = posts.filter(post => post !== null);

        res.status(200).json({ posts: validPosts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

function parsePost(fileContents) {
    try {
        const {
            id,
            file,
            content,
            date
        } = JSON.parse(fileContents);

        return {
            id,
            file,
            content,
            date
        };
    } catch (error) {
        console.error("Error parsing post:", error);
        return null;
    }
}

