<script>
  import { onMount } from "svelte";
  import { user, fetchUser } from "../../stores/gallery";
  import { goto } from "$app/navigation"; // Import goto for navigation
  import { fade, fly } from "svelte/transition"; // Import transitions

  let images = [];
  let selectedImage = null;
  let selectedImageId = null;
  let commentText = "";
  let comments = [];

  // Fetch data
  onMount(() => {
    fetchUser();
    fetchImages();
  });

  $user && console.log("Debugging User Store:", $user.id);

  async function fetchImages() {
  try {
    const response = await fetch("http://localhost:3000/food");
    if (response.ok) {
      const result = await response.json();
      images = result.files.map((file) => ({
        id: file.id,
        url: file.filepath,
        name: file.name,
        description: file.description,
        category: file.category || "Uncategorized",
        owner_email: file.owner_email // Ensure backend includes this
      }));
    } else {
      alert("Failed to fetch images!");
    }
  } catch (error) {
    alert("1 Error fetching images: " + error);
  }
}


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
          image_id: selectedImageId,
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
    if (!selectedImageId) return;

    const confirmDelete = confirm(
      "Are you sure you want to delete this image?",
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/image/${selectedImageId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        images = images.filter((img) => img.id !== selectedImageId);
        closePreview();
      } else {
        alert("Failed to delete image!");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  }

  function handleEditImage() {
    if (selectedImageId) {
      goto(`/edit_img/${selectedImageId}`); // Navigate to the edit page
    }
  }

  function openImage(url, id, name, description, category, owner_email) {
    selectedImage = { url, id, name, description, category, owner_email };
    selectedImageId = id;
    fetchComments(id);
    document.getElementById("naver").style.visibility = "hidden";
  }

  function closePreview() {
    selectedImage = null;
    selectedImageId = null;
    document.getElementById("naver").style.visibility = "visible";
  }

  function toggleFullscreen() {
    const img = document.getElementById("pre_img");

    if (!document.fullscreenElement) {
      if (img.requestFullscreen) {
        img.requestFullscreen();
      } else if (img.mozRequestFullScreen) {
        img.mozRequestFullScreen();
      } else if (img.webkitRequestFullscreen) {
        img.webkitRequestFullscreen();
      } else if (img.msRequestFullscreen) {
        img.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  let img = [];
  let currentIndex = 0;
  let interval;
  let showSlideshow = false;

  async function fetchImage() {
    try {
      const response = await fetch("http://localhost:3000/food");
      if (response.ok) {
        const result = await response.json();
        img = result.files.map((file) => file.filepath);
      } else {
        alert("Failed to fetch images!");
      }
    } catch (error) {
      alert("2 Error fetching images: " + error);
    }
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % img.length;
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + img.length) % img.length;
  }

  function startSlideshow() {
    showSlideshow = true;
    interval = setInterval(nextImage, 8000);
    document.documentElement.requestFullscreen();
  }

  function stopSlideshow() {
    showSlideshow = false;
    clearInterval(interval);
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
<button on:click={startSlideshow} class="bg-gray-700 text-white px-4 py-2 rounded">Fullscreen Slideshow</button>
<div class="masonry p-5">
  {#each images as img (img.id)}
    <div
      class="cursor-pointer transition-transform transform hover:scale-105"
      on:click={() =>
        openImage(img.url, img.id, img.name, img.description, img.category, img.owner_email)}
    >
      <img
        class="w-full h-auto rounded-lg"
        src={img.url}
        alt="Uploaded image"
      />
    </div>
  {/each}
</div>

{#if selectedImage}
  <div class="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center overflow-auto" transition:fade={{ duration: 100 }}>
    <p class="absolute top-5 left-5 text-white text-xl rounded cursor-pointer p-5 font-bold" on:click={closePreview}>
      Close
    </p>
    
    <img class="w-[70%] mt-4 cursor-pointer" src={selectedImage.url} alt="Preview" id="pre_img" on:click={toggleFullscreen} />

    <div class="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg w-[100%] p-25 mt-5">
      <h3 class="text-4xl font-bold inline">{selectedImage.name}</h3>
      
      <a href={selectedImage.url} download={selectedImage.name}>
        <button class="absolute right-15 bg-blue-800 h-10 w-30 rounded-lg hover:bg-blue-900">
          Download
        </button>
      </a>

      {#if $user && $user.email === selectedImage.owner_email} <!-- Check ownership -->
        <button class="absolute right-81 bg-yellow-700 h-10 w-30 rounded-lg hover:bg-yellow-800" on:click={handleEditImage}>
          Edit
        </button>
        <button class="absolute right-48 bg-red-800 h-10 w-30 rounded-lg hover:bg-red-900" on:click={handleDeleteImage}>
          Delete
        </button>
      {/if}

      <p class="text-gray-300 pt-6 text-l">
        Category <span class="font-semibold">{selectedImage.category}</span>
      </p>

      <hr class="my-4 border-gray-600" />
      <p class="leading-relaxed text-xl">{selectedImage.description}</p>

      <hr class="my-4 border-gray-600" />
      <div class="mt-5">
        <h3 class="text-3xl font-semibold">Comments</h3>
        <br>
        {#each comments as comment}
          <p class="mt-2 text-xl">
            ▪ {comment.comment}
            <span class="text-gray-500 ml-2">{new Date(comment.created_at).toLocaleDateString("en-CA")}</span>
          </p>
        {/each}
        <br>
      </div>

      <textarea class="w-full p-2 mt-3 border rounded bg-gray-800 text-white placeholder-gray-400" bind:value={commentText} placeholder="Add comment ..."></textarea>
      <button class="mt-2 px-4 py-2 bg-blue-500 text-white rounded" on:click={handleAddComment}>
        Add Comment
      </button>
    </div>
  </div>
{/if}

<!-- <button on:click={startSlideshow} class="bg-gray-700 text-white px-4 py-2 rounded">Start Fullscreen Slideshow</button> -->

{#if showSlideshow}
  <div class="fixed inset-0 bg-black flex items-center justify-center">
    {#if img.length > 0}
    <img 
    src={img[currentIndex]} 
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
