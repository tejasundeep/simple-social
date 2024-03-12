import fs from 'fs';
import path from 'path';

const updatePost = async (req, res) => {
    try {
        const postId = parseInt(req.query.slug); // Parse post ID from query parameter

        if (isNaN(postId)) { // Check if post ID is not a number
            return res.status(400).json({ error: "Invalid post ID" });
        }

        const { content } = req.body;
        if (!content || typeof content !== 'string') {
            return res.status(400).json({ error: "Content is required and must be a string" });
        }

        const filePath = path.join(process.cwd(), "src", "database", "posts", `${postId}.json`);

        // Check if the post file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Read the existing post data
        const existingPostData = await fs.promises.readFile(filePath, 'utf-8');
        const existingPost = JSON.parse(existingPostData);

        // Update the content
        existingPost.content = content;

        // Write the updated post data back to the file
        await fs.promises.writeFile(filePath, JSON.stringify(existingPost));

        return res.status(200).json({ message: "Post updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: `Sorry, something happened: ${error.message}` });
    }
};

export const config = { api: { bodyParser: true } };

export default function handler(req, res) {
    if (req.method !== "PUT") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    updatePost(req, res);
}
