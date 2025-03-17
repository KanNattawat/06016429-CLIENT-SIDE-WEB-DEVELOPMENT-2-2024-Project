import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { goto } from "$app/navigation";

export let user = writable(null);
export let images = writable([]);
export let selectedImage = writable(null);
export let selectedImageId = writable(null);
export let comments = writable([]);
export let commentText = writable("");
export let img = writable([]);
export let currentIndex = writable(0);
export let showSlideshow = writable(false);
let interval;

export async function login() {
    if (browser) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            goto("/login");
        }
    }
}

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
    } catch {
        alert("User not authorized");
    }
}

export async function logout() {
    try {
        const response = await fetch("http://localhost:3000/logout", {
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Logout failed with status ${response.status}`);
        }

        user.set(null);
        localStorage.removeItem('favorites');
        console.log("User logged out successfully");

        window.location.href = "http://localhost:5173";
    } catch (error) {
        console.error("Logout error:", error);
        alert("Log out failed. Check the console for details.");
    }
}

export async function fetchImages(page) {
    try {
        const response = await fetch(`http://localhost:3000/${page}`);
        if (response.ok) {
            const result = await response.json();
            images.set(result.files.map((file) => ({
                id: file.id,
                url: file.filepath,
                name: file.name,
                description: file.description,
                category: file.category || "Uncategorized",
                owner_email: file.owner_email || "Anonymous",
                visibility: file.visibility,
            })));
        } else {
            alert("Failed to fetch images!");
        }
    } catch (error) {
        alert("Error fetching images: " + error);
    }
}

export async function fetchFavoriteImages(favorites) {
    try {
        // images = writable([]);
        const response = await fetch("http://localhost:3000/files"); // ดึงภาพทั้งหมด
        if (response.ok) {
            const result = await response.json();
            // Check if favorites is an array and filter based on its contents
            if (!Array.isArray(favorites)) {
                images.set(result.files
                    .filter(file => favorites.has(file.id)) // กรองเฉพาะภาพที่ถูกใจ
                    .map(file => ({
                        id: file.id,
                        url: file.filepath,
                        name: file.name,
                        description: file.description,
                        category: file.category || "Uncategorized",
                        visibility: file.visibility,
                    })));
                    console.log(images);
            } else {
                console.error("Favorites must be an array!");
            }
        } else {
            console.error("Failed to fetch images!");
        }
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}


export function openImage(url, id, name, description, category, owner_email) {
    selectedImage.set({ url, id, name, description, category, owner_email });
    selectedImageId.set(id);
    console.log(id, selectedImageId);
    // fetchComments(selectedImageId);
}

export function closePreview() {
    selectedImage.set(null);
    selectedImageId.set(null);
}

export async function fetchComments(image_id) {
    try {
        const response = await fetch(
            `http://localhost:3000/comments/${image_id}`,
        );
        const data = await response.json();
        comments.set(data.comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        comments.set([]);
    }
}

export async function handleAddComment() {
    if (commentText.trim() === "") return;

    try {
        const response = await fetch("http://localhost:3000/comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            image_id: selectedImageId,
            comment: commentText,
            }),
        });

        if (response.ok) {
            const result = await response.json();
            comments.set([...comments, result.comment]);
            commentText.set("");
        } else {
            alert("Failed to add comment!");
        }
    } catch (error) {
        console.error("Error posting comment:", error);
    }
}

export async function handleEditImage() {
    if ($selectedImageId) {
        goto(`/edit_img/${$selectedImageId}`);
    }
}

export async function handleDeleteImage() {
    if (!$selectedImageId) return;

    const confirmDelete = confirm("Are you sure you want to delete this image?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`http://localhost:3000/image/${$selectedImageId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            images.update((imgs) => imgs.filter((img) => img.id !== $selectedImageId));
            closePreview();
        } else {
            alert("Failed to delete image!");
        }
    } catch (error) {
        console.error("Error deleting image:", error);
    }
}

export function toggleFullscreen() {
    const img = document.getElementById("pre_img");

    if (!document.fullscreenElement) {
        if (img.requestFullscreen) img.requestFullscreen();
        else if (img.mozRequestFullScreen) img.mozRequestFullScreen();
        else if (img.webkitRequestFullscreen) img.webkitRequestFullscreen();
        else if (img.msRequestFullscreen) img.msRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }
}

export async function fetchImage() {
    try {
        const response = await fetch("http://localhost:3000/files");
        if (response.ok) {
            const result = await response.json();
            img.set(result.files.map((file) => file.filepath));
        } else {
            alert("Failed to fetch images!");
        }
    } catch (error) {
        alert("Error fetching images: " + error);
    }
}

export function nextImage() {
    currentIndex.update((index) => (index + 1) % $img.length);
}

export function prevImage() {
    currentIndex.update((index) => (index - 1 + $img.length) % $img.length);
}

export function startSlideshow() {
    showSlideshow.set(true);
    interval = setInterval(nextImage, 8000);
    document.documentElement.requestFullscreen();
}

export function stopSlideshow() {
    showSlideshow.set(false);
    clearInterval(interval);
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

export function handleImageClick() {
    stopSlideshow();
}
