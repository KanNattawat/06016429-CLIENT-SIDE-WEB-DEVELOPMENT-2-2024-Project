import { writable, get } from "svelte/store";
import { browser } from "$app/environment";
import { goto } from "$app/navigation";

export let user = writable(null);
export let images = writable([]);
export let selectedImage = writable(null);
export let selectedImageId = writable(null);
export let comments = writable([]);
export let commentText = writable("");
export let favorites = writable(new Set());
export let slide = writable([]);
export let currentIndex = writable(0);
export let showSlideshow = writable(false);

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
            fetchFavorite();
        }
    } catch {
        console.error("User not authorized");
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
        favorites.set(new Set());
        localStorage.removeItem("favorites");
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
            console.error("Failed to fetch images!");
        }
    } catch (error) {
        console.error("Error fetching images: " + error);
    }
}

export function handleEditImage() {
    const id = get(selectedImageId);

    if (id) {
        goto(`/edit_img/${id}`);
    }
}

export async function handleDeleteImage() {
    const id = get(selectedImageId);
    
    if (!id) return;

    const confirmDelete = confirm(
        "Are you sure you want to delete this image?",
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(
            `http://localhost:3000/image/${id}`,
            { method: "DELETE", },
        );

        if (response.ok) {
            images.update((currentImg) => currentImg.filter((img) => img.id !== id));
            closePreview();
        } else {
            alert("Failed to delete image!");
        }
    } catch (error) {
        console.error("Error deleting image:", error);
    }
}

export function openImage(url, id, name, description, category, owner_email) {
    selectedImage.set({ url, id, name, description, category, owner_email });
    selectedImageId.set(id);
    fetchComments(id);
}

export function closePreview() {
    selectedImage.set(null);
    selectedImageId.set(null);
}

export async function fetchComments(image_id) {
    if (!image_id) return;

    try {
        const response = await fetch(`http://localhost:3000/comments/${image_id}`);
        const data = await response.json();
        comments.set(data.comments || []);
    } catch (error) {
        console.error("Error fetching comments:", error);
        comments.set([]);
    }
}

export async function handleAddComment() {
    const id = get(selectedImageId);
    const userData = get(user);
    const text = get(commentText).trim();

    if (!id || !userData || text === "") return;

    console.log("Sending comment data:", {
        image_id: id,
        userImg: userData.picture,
        username: userData.name || "Anonymous",
        user_email: userData.email,
        comment: text
    });

    try {
        const response = await fetch("http://localhost:3000/comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            image_id: id,
            userImg: userData.picture,
            username: userData.name || "Anonymous",
            user_email: userData.email,
            comment: text,
            }),
        });

        if (response.ok) {
            const result = await response.json();
            comments.update(current => [result.comment, ...current]);
            commentText.set("");
        } else {
            alert("Failed to add comment!");
        }
    } catch (error) {
        console.error("Error posting comment:", error);
    }
}

export async function fetchFavorites() {
    const userData = get(user);
    if (!userData) return;

    // โหลด favorites จาก localStorage
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
        favorites.set(new Set(JSON.parse(storedFavorites)));
    }

    try {
        const response = await fetch(`http://localhost:3000/favorites/${encodeURIComponent(userData.email)}`);
        const data = await response.json();

        if (data.favorites && Array.isArray(data.favorites)) {
            favorites.set(new Set(data.favorites.map((fav) => fav.image_id || fav.id)));
        } else {
            console.error("Invalid favorites response:", data);
        }

        console.log("Updated favorites:", get(favorites)); // ต้องใช้ get() เพื่อดึงค่า
    } catch (error) {
        console.error("Error fetching favorites:", error);
    }
}


export async function fetchFavoriteImages(favorites) {
    try {
        const response = await fetch("http://localhost:3000/fav"); // ดึงภาพทั้งหมด
        if (response.ok) {
            const result = await response.json();
            if (!Array.isArray(favorites)) {
                images.set(result.files
                    .filter(file => favorites.has(file.id)) // กรองเฉพาะภาพที่ถูกใจ
                    .map(file => ({
                        id: file.id,
                        url: file.filepath,
                        name: file.name,
                        description: file.description,
                        category: file.category || "Uncategorized",
                        owner_email: file.owner_email || "Anonymous",
                        visibility: file.visibility,
                    })));
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

export async function toggleFavorite(imageId) {
    const userData = get(user);
    const currentFav = get(favorites);
    const isFavorite = currentFav.has(imageId);
    const method = isFavorite ? "DELETE" : "POST";

    try {
        await fetch("http://localhost:3000/favorite", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_email: userData.email, image_id: imageId }),
        });

        favorites.update((fav) => {
            const updatedFavs = new Set(fav);
            if (isFavorite) {
                updatedFavs.delete(imageId);
            } else {
                updatedFavs.add(imageId);
            }
            // บันทึกลง localStorage
            localStorage.setItem("favorites", JSON.stringify([...updatedFavs]));
            return updatedFavs;
        });

    } catch (error) {
        console.error("Error toggling favorite:", error);
    }
}

export function toggleFullscreen() {
    if (!browser) return;

    const slide = document.getElementById("pre_img");

    if (!slide) {
        console.error("Image element not found!");
        return;
    }

    if (!document.fullscreenElement) {
        document.getElementById("pre_img")
            .setAttribute("class", "w-fit pt-0 pt-0 mt-4 cursor-pointer pt-0 h-[calc(75vh)]");
        slide.requestFullscreen?.() || slide.mozRequestFullScreen?.() ||
        slide.webkitRequestFullscreen?.() || slide.msRequestFullscreen?.();
    } else {
        document
            .getElementById("pre_img")
            .setAttribute("class", "w-fit pt-18 pt-0 mt-4 cursor-pointer pt-0 h-[calc(75vh)]");
        document.exitFullscreen?.() || document.mozCancelFullScreen?.() ||
        document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
    }
}

export async function fetchSlideImage(filter = "files") {
    try {
        const response = await fetch(`http://localhost:3000/${filter}`);
        if (response.ok) {
            const result = await response.json();
            if (result.files && result.files.length > 0) {
                slide.set(result.files.map((file) => file.filepath));
            } else {
                slide.set([])
            }
        } else {
            alert("Failed to fetch images slide!");
        }
    } catch (error) {
        console.error("Error fetching images: " + error);
    }
}

export async function startSlideshow() {
    let slideImages = get(slide);

    if (!slideImages || slideImages.length === 0) {
        alert("No images available for slideshow.");
        return;
    }

    showSlideshow.set(true);

    const nav = document.getElementById("naver");
    if (nav) nav.style.visibility = "hidden";

    document.documentElement.requestFullscreen();
}

export async function stopSlideshow() {
    showSlideshow.set(false);
    currentIndex.set(0);

    const nav = document.getElementById("naver");
    if (nav) nav.style.visibility = "visible";

    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

function nextImage() {
    slide.update((img) => {
        if (img.length === 0) return img;
        currentIndex.update((index) => (index + 1) % img.length);
        return img;
    });
}

function prevImage() {
    slide.update((img) => {
        if (img.length === 0) return img;
        currentIndex.update((index) => (index - 1 + img.length) % img.length);
        return img;
    });
}

export async function handleSlide(event) {
    const key = event.key.toLowerCase();

    if (event.key === "arrowright" || event.key === "d" || event.key === " " || event.key === "enter") {
        nextImage();
    } else if (event.key === "arrowleft" || event.key === "a") {
        prevImage();
    } else if (event.key === "escape") {
        stopSlideshow();
    }
}
