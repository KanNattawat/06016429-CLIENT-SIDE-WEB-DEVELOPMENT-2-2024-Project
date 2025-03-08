import { writable } from "svelte/store";

export let user = writable(null);
export let images = writable([]);
export let selectedImage = writable(null);
export let selectedImageId = writable(null);
export let commentText = writable("");
export let comments = writable([]);

export async function fetchUser() {
    try {
        const response = await fetch("http://localhost:3000/auth/user", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            user.set(null);
            return;
        }
        const data = await response.json();
        if (data.user) {
            user.set(data.user);
        }
    }
    catch {
        alert("User not authorized");
    }
}

export async function logout() {
    await fetch("http://localhost:3000/logout", { credentials: "include" });
    user.set(null);
}

export async function fetchImages() {
    try {
        const response = await fetch("http://localhost:3000/files");
        if (response.ok) {
            const result = await response.json();
            images = result.files.map((file) => ({
            id: file.id,
            url: file.filepath,
            name: file.name,
            description: file.description,
            category: file.category || "Uncategorized", // Directly using category as a string
            }));
        } else {
            alert("Failed to fetch images!");
        }
    } catch (error) {
        alert("Error fetching images: " + error);
    }
}

export async function fetchComments(image_id) {
    try {
        const response = await fetch(`http://localhost:3000/comments/${image_id}`);
        const data = await response.json();
        comments = data.comments;
        } catch (error) {
        console.error("Error fetching comments:", error);
        comments = [];
    }
}

export async function handleAddComment() {
    if (commentText.trim() === "") return;

    try {
        const response = await fetch("http://localhost:3000/comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_id: selectedImageId, comment: commentText }),
        });

        if (response.ok) {
            const result = await response.json();
            comments = [...comments, result.comment];
            commentText = "";
        } else {
            alert("Failed to add comment!");
        }
    } catch (error) {
        console.error("Error posting comment:", error);
    }
}

export async function openImage(url, id, name, description, category) {
    selectedImage = { url, id, name, description, category };
    selectedImageId = id;
    fetchComments(id);
}

export async function closePreview() {
    selectedImage = null;
    selectedImageId = null;
}
