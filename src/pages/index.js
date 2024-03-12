import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Form, Button, Container, Alert, Modal } from "react-bootstrap";
import EditPost from "./EditPost";

export default function CreatePost() {
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [posts, setPosts] = useState([]);
    const [editPostData, setEditPostData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false); // State for controlling modal visibility
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get("/api/read");
            setPosts(response.data.posts);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const handleFileChange = () => {
        const selectedFile = fileInputRef.current.files[0];
        setFile(selectedFile);
    };

    const renderFile = (fileUrl) => {
        const fileExtension = fileUrl.split('.').pop().toLowerCase();
        const fileType = (() => {
            if (fileExtension.match(/(png|jpg|jpeg|gif)$/)) return 'image';
            if (fileExtension.match(/(mp4|webm|ogg)$/)) return 'video';
            if (fileExtension.match(/(mp3|wav|ogg)$/)) return 'audio';
            return 'other';
        })();

        switch (fileType) {
            case "image":
                return <img width="300" src={fileUrl} alt="Image" />;
            case "video":
                return <video width="300" controls src={fileUrl} type={`video/${fileExtension}`} />;
            case "audio":
                return <audio width="300" controls><source src={fileUrl} type={`audio/${fileExtension}`} /></audio>;
            default:
                return <a href={fileUrl}>Download File</a>;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        fileInputRef.current.value = null;

        try {
            const formData = new FormData();
            formData.append("content", content);
            formData.append("file", file);

            await axios.post("/api/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setContent("");
            setFile(null);
            setErrorMessage("");
            fetchPosts();
            alert("Post created successfully!");
        } catch (error) {
            setErrorMessage(error.response.data.error);
        }
    };

    const handleDelete = async (postId) => {
        try {
            await axios.delete(`/api/delete?slug=${postId}`);
            fetchPosts();
            alert("Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const handleEdit = (post) => {
        setEditPostData(post);
        setShowEditModal(true); // Show the modal when editing post
    };

    const handleUpdate = () => {
        setEditPostData(null);
        fetchPosts();
        setShowEditModal(false); // Close the modal after updating
    };

    const handleCancelEdit = () => {
        setEditPostData(null);
        setShowEditModal(false); // Hide the modal when canceling edit
    };

    return (
        <Container>
            <h1 className="mt-3">Simple Social</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="content" className="mt-4">
                    <Form.Control
                        as="textarea"
                        value={content}
                        placeholder="Write something..."
                        onChange={(e) => setContent(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="file" className="mt-2">
                    <Form.Control
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </Form.Group>
                <Button className="mt-2" type="submit">Submit</Button>
            </Form>

            <div className="newsfeed mt-4">
                {posts.map(post => (
                    <div key={post.id}>
                        {post.file && renderFile(post.file)}<br />
                        {post.content}<br />
                        <Button variant="primary" onClick={() => handleEdit(post)} className="me-2">Edit</Button>
                        <Button variant="danger" onClick={() => handleDelete(post.id)}>Delete</Button>
                    </div>
                ))}
            </div>

            <Modal show={showEditModal} onHide={handleCancelEdit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editPostData && (
                        <EditPost
                            post={editPostData}
                            onUpdate={handleUpdate}
                            onCancel={handleCancelEdit}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
}
