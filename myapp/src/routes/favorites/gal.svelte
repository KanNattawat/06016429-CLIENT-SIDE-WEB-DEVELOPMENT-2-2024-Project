<script>
  import { onMount } from "svelte";
  import {
    user,
    images,
    selectedImage,
    selectedImageId,
    fetchUser,
    fetchFavoriteImages,
    openImage,
    closePreview,
  } from "../../stores/gallery";
  import { goto } from "$app/navigation";
  import { fade, fly } from "svelte/transition";

  let comments = [];
  let commentText = "";
  let img = [];
  let currentIndex = 0;
  let interval;
  let showSlideshow = false;

  onMount(async () => {
    await fetchUser();
    await fetchFavorites();
    await fetchFavoriteImages(favorites);
    openImage();
    closePreview();
  });

  let favorites = new Set();

  async function toggleFavorite(imageId) {
    if (!user) return alert("Please log in to favorite images!");

    const isFavorite = favorites.has(imageId);
    const method = isFavorite ? "DELETE" : "POST";

    try {
      await fetch("http://localhost:3000/favorite", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: $user.email, image_id: imageId }),
      });

      favorites = new Set(favorites);

      if (isFavorite) {
        favorites.delete(imageId);
      } else {
        favorites.add(imageId);
      }

      localStorage.setItem("favorites", JSON.stringify([...favorites]));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  async function fetchFavorites() {
    if (!user) return;

    favorites = new Set();

    // โหลดค่าจาก localStorage
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      favorites = new Set(JSON.parse(storedFavorites));
    }

    try {
      const response = await fetch(
        `http://localhost:3000/favorites/${encodeURIComponent($user.email)}`,
      );
      const data = await response.json();

      if (data.favorites && Array.isArray(data.favorites)) {
        favorites = new Set(
          data.favorites.map((fav) => fav.image_id || fav.id),
        );
      } else {
        console.error("Invalid favorites response:", data);
      }

      console.log("Updated favorites:", favorites);
      localStorage.setItem("favorites", JSON.stringify([...favorites]));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  }

  $user && console.log("Debugging User Store:", $user.id);

  async function fetchComments(image_id) {
    try {
      const response = await fetch(
        `http://localhost:3000/comments/${image_id}`,
      );
      const data = await response.json();
      comments = data.comments;
    } catch (error) {
      console.error("Error fetching comments:", error);
      comments = [];
    }
  }

  async function handleAddComment() {
    if (commentText.trim() === "") return;

    try {
      const response = await fetch("http://localhost:3000/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_id: $selectedImageId,
          comment: commentText,
        }),
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

  async function handleDeleteImage() {
    if (!$selectedImageId) return;

    const confirmDelete = confirm(
      "Are you sure you want to delete this image?",
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/image/${$selectedImageId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        $images = $images.filter((img) => img.id !== $selectedImageId);
        closePreview();
      } else {
        alert("Failed to delete image!");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  }

  function handleEditImage() {
    if ($selectedImageId) {
      goto(`/edit_img/${$selectedImageId}`);
    }
  }

  function toggleFullscreen() {
    const img = document.getElementById("pre_img");

    if (!img) {
      console.error("Image element not found!");
      return;
    }

    if (!document.fullscreenElement) {
      img.requestFullscreen?.() ||
        img.mozRequestFullScreen?.() ||
        img.webkitRequestFullscreen?.() ||
        img.msRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ||
        document.mozCancelFullScreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.msExitFullscreen?.();
    }
  }

  async function fetchImage() {
    try {
      const response = await fetch(`http://localhost:3000/files`);
      if (response.ok) {
        const result = await response.json();

        img = result.files
          .filter((file) => favorites.has(file.id)) // กรองเฉพาะ Fav Images
          .map((file) => ({
            id: file.id,
            url: file.filepath,
            name: file.name,
            description: file.description,
            category: file.category || "Uncategorized",
            visibility: file.visibility || "Public",
          }));
      } else {
        alert("Failed to fetch images!");
      }
    } catch (error) {
      alert("Error fetching images: " + error);
    }
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % img.length;
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + img.length) % img.length;
  }

  function startSlideshow() {
  if (!$images || $images.length === 0) {
    alert("No images available for slideshow.");
    return;
  }

  showSlideshow = true;
  interval = setInterval(nextImage, 6000);

  const nav = document.getElementById("naver");
  if (nav) nav.style.visibility = "hidden";

  document.documentElement.requestFullscreen();
}


  function stopSlideshow() {
    showSlideshow = false;
    clearInterval(interval);

    const nav = document.getElementById("naver");
    if (nav) nav.style.visibility = "visible";

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  function handleImageClick() {
    stopSlideshow();
  }

  onMount(async () => {
    await fetchImage();
  });
</script>

<button
  on:click={startSlideshow}
  class="bg-gray-700 text-white px-4 py-2 rounded">Fullscreen Slideshow</button
>
{#if $images}
  <div class="masonry p-5">
    {#each $images as img (img.id)}
      <div
        class="cursor-pointer transition-transform transform hover:scale-105"
        on:click={() =>
          openImage(
            img.url,
            img.id,
            img.name,
            img.description,
            img.category,
            img.owner_email,
            $user.email
          )}
      >
        <img
          class="w-full h-auto rounded-lg"
          src={img.url}
          alt="Uploaded image"
        />
      </div>
    {/each}
  </div>

  {#if $selectedImage}
    <div
      class="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center overflow-auto"
      transition:fade={{ duration: 100 }}
    >
      <button
        class="absolute top-25 left-10 bg-blue-600 hover:bg-blue-700 text-white text-xl rounded-2xl cursor-pointer mx-15 my-5 px-3 py-1"
        on:click={closePreview}
        >Close
      </button>

      <img
        class="w-fit pt-18 mt-4 cursor-pointer pt-0 h-[calc(75vh)]"
        src={$selectedImage.url}
        alt="Preview"
        id="pre_img"
        on:click={() => toggleFullscreen()}
      />

      <div
        class="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg w-full px-25 py-10 mt-0"
      >
        <h3 class="text-4xl font-bold inline">{$selectedImage.name}</h3>

        <a href={$selectedImage.url} download={$selectedImage.name}>
          <button
            class="absolute right-15 bg-blue-800 h-10 w-30 rounded-lg hover:bg-blue-900"
          >
            Download
          </button>
        </a>

        {#if $user && $user.email === $selectedImage.owner_email}
          <button
            class="absolute right-81 bg-yellow-700 h-10 w-30 rounded-lg hover:bg-yellow-800"
            on:click={handleEditImage}
          >
            Edit
          </button>
          <button
            class="absolute right-48 bg-red-800 h-10 w-30 rounded-lg hover:bg-red-900"
            on:click={handleDeleteImage}
          >
            Delete
          </button>
        {/if}

        <button
          class="absolute right-15 bg-gray-800 rounded-lg hover:bg-gray-900 mt-16"
          on:click|stopPropagation={() => toggleFavorite($selectedImageId)}
        >
          {#if favorites.has($selectedImageId)}
            ❤️ Favorite
          {:else}
            🤍 Add To Favorite
          {/if}
        </button>

        <p class="text-gray-300 pt-6 text-l">
          Category <span class="font-semibold">{$selectedImage.category}</span>
        </p>

        <hr class="my-4 border-gray-600" />
        <p class="leading-relaxed text-xl">{$selectedImage.description}</p>

        <hr class="my-4 border-gray-600" />
        <div class="mt-5">
          <h3 class="text-3xl font-semibold">Comments</h3>
          <br />
          {#each comments as comment}
            <p class="mt-2 text-xl">
              ▪ {comment.comment}
              <span class="text-gray-500 ml-2"
                >{new Date(comment.created_at).toLocaleDateString(
                  "en-CA",
                )}</span
              >
            </p>
          {/each}
          <br />
        </div>
        {#if $user}
          <textarea
            class="w-full p-2 mt-3 border rounded bg-gray-800 text-white placeholder-gray-400"
            bind:value={commentText}
            placeholder="Add comment ..."
          ></textarea>
          <button
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            on:click={handleAddComment}>Add Comment</button
          >
        {:else}
          <textarea
            class="w-full p-2 mt-3 border rounded bg-gray-800 text-white placeholder-gray-400 cursor-text"
            placeholder="Please login before adding comment ..."
            disabled
          ></textarea>
        {/if}
      </div>
    </div>
  {/if}

  {#if showSlideshow}
    <div class="fixed inset-0 bg-black flex items-center justify-center">
      {#if img.length > 0}
        <img
          src={img[currentIndex].url}
          alt="Slideshow image"
          class="max-w-full max-h-full object-contain"
          on:click={handleImageClick}
          transition:fade={{ duration: 500 }}
        />
      {:else}
        <p class="text-white">Loading images...</p>
      {/if}
    </div>
  {/if}
{/if}
