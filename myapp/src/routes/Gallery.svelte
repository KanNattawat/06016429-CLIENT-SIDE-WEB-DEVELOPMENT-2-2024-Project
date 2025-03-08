<script>
  import { onMount } from "svelte";
  import { user, fetchUser } from "../stores/gallery";
  import { goto } from "$app/navigation"; // Import goto for navigation

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

  $user && console.log("Debugging User Store:", $user);

  async function fetchImages() {
    try {
      const response = await fetch("http://localhost:3000/files");
      if (response.ok) {
        const result = await response.json();
        images = result.files.map((file) => ({
          id: file.id,
          url: file.filepath,
          name: file.name,
          description: file.description,
          category: file.category || "Uncategorized",
        }));
      } else {
        alert("Failed to fetch images!");
      }
    } catch (error) {
      alert("Error fetching images: " + error);
    }
  }

  async function fetchComments(image_id) {
    try {
      const response = await fetch(`http://localhost:3000/comments/${image_id}`);
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

  async function handleDeleteImage() {
    if (!selectedImageId) return;
    
    const confirmDelete = confirm("Are you sure you want to delete this image?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/image/${selectedImageId}`, {
        method: "DELETE",
      });

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

  function openImage(url, id, name, description, category) {
    selectedImage = { url, id, name, description, category };
    selectedImageId = id;
    fetchComments(id);
    document.getElementById("naver").style.visibility = "hidden";
  }

  function closePreview() {
    selectedImage = null;
    selectedImageId = null;
    document.getElementById("naver").style.visibility = "visible";
  }
</script>

<div class="masonry p-5">
  {#each images as img (img.id)}
    <div class="cursor-pointer transition-transform transform hover:scale-105" on:click={() => openImage(img.url, img.id, img.name, img.description, img.category)}>
      <img class="w-full h-auto rounded-lg" src={img.url} alt="Uploaded image" />
    </div>
  {/each}
</div>

{#if selectedImage}
<div class="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center p-5 overflow-auto">
  <!-- <button class="absolute top-5 right-5 px-4 py-2 bg-black text-white rounded" on:click={closePreview}>
    Close
  </button> -->
  <p class="absolute top-5 right-5 bg-black text-white rounded cursor-pointer" on:click={closePreview}>Close</p>
  <img class="max-w-[90%] max-h-[70vh] mt-4" src={selectedImage.url} alt="Preview" />
  <div class="bg-gray-900 text-white rounded-lg w-[100%] p-5 mt-5">
      <h3 class="text-xl font-bold">{selectedImage.name}</h3>
      <p class="text-sm text-gray-300">
          Category <span class="font-semibold">{selectedImage.category}</span>
      </p>      
      <hr class="my-4 border-gray-600" />
      <p class="leading-relaxed">{selectedImage.description}</p>

      <!-- Edit and Delete Buttons -->
      <div class="mt-4 flex gap-4">
          <button class="px-4 py-2 bg-yellow-500 text-white rounded" on:click={handleEditImage}>
              Edit Image
          </button>
          <button class="px-4 py-2 bg-red-600 text-white rounded" on:click={handleDeleteImage}>
              Delete Image
          </button>
      </div>

      <div class="mt-5">
          <h3 class="text-lg font-semibold">Comments</h3>
          {#each comments as comment}
              <p class="mt-2">{comment.comment}</p>
          {/each}
      </div>
      <textarea class="w-full p-2 mt-3 border rounded bg-gray-800 text-white placeholder-gray-400" 
                bind:value={commentText} 
                placeholder="Add comment ..."></textarea>
                <br>
      <button class="mt-2 px-4 py-2 bg-blue-500 text-white rounded" on:click={handleAddComment}>
          Add Comment
      </button>
  </div>
</div>

{/if}
