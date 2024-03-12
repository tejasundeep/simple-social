import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

export default function EditPost({ post, onUpdate, onCancel }) {
    const [updatedContent, setUpdatedContent] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (post) {
            setUpdatedContent(post.content);
        }
    }, [post]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await axios.put(`/api/update?slug=${post.id}`, {
                content: updatedContent,
            });
            onUpdate();
            alert("Post updated successfully!");
        } catch (error) {
            setErrorMessage(error.response.data.error);
        }
    };

    if (!post) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="content" className="mb-3">
                    <Form.Control
                        as="textarea"
                        value={updatedContent}
                        onChange={(e) => setUpdatedContent(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="me-2">
                    Update
                </Button>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </Form>
        </div>
    );
}
