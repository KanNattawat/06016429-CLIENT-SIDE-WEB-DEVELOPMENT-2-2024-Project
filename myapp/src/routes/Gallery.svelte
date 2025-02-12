<script>
  import { onMount } from 'svelte';

  let images = [];
  let selectedImage = null;
  let selectedImageId = null;

  async function fetchImages() {
    try {
      const response = await fetch("http://localhost:3000/files");
      if (response.ok) {
        const result = await response.json();
        images = result.files.map(file => ({ id: file.id, url: file.filepath }));
      } else {
        alert("Failed to fetch images!");
      }
    } catch (error) {
      alert("Error fetching images: " + error);
    }
  }

  onMount(fetchImages);

  // async function handleUpload() {
  //   const input = document.querySelector(".upload");
  //   const files = input.files;

  //   if (files.length === 0) {
  //     alert("Please select files to upload.");
  //     return;
  //   }

  //   const formData = new FormData();
  //   for (let file of files) {
  //     formData.append("images", file);
  //   }

  //   try {
  //     const response = await fetch("http://localhost:3000/upload", {
  //       method: "POST",
  //       body: formData
  //     });

  //     const result = await response.json();

  //     if (response.ok) {
  //       images = [...images, ...result.files.map(file => ({ id: file.id, url: file.filepath }))];
  //       input.value = "";
  //     } else {
  //       alert("Upload failed!");
  //     }
  //   } catch (error) {
  //     console.error("Error uploading files:", error);
  //     alert("An error occurred while uploading.");
  //   }
  // }

  async function deleteImage(id) {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const response = await fetch(`http://localhost:3000/delete/${id}`, { method: "DELETE" });
      if (response.ok) {
        images = images.filter(img => img.id !== id);
        closePreview();
      } else {
        alert("Failed to delete image!");
      }
    } catch (error) {
      alert("Error deleting image: " + error);
    }
  }

  function openImage(url, id) {
    selectedImage = url;
    selectedImageId = id;
  }

  function closePreview() {
    selectedImage = null;
    selectedImageId = null;
  }
</script>

<style>
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
    padding: 20px;
  }
  .gallery img {
    width: 100%;
    height: auto;
    cursor: pointer;
    border-radius: 5px;
    transition: transform 0.3s;
  }
  .gallery img:hover {
    transform: scale(1.05);
  }
  .upload {
    margin: 20px;
    padding: 10px;
  }
  .preview {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .preview img {
    max-width: 90%;
    max-height: 90%;
  }
  .preview button {
    margin-top: 10px;
    background: red;
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    border-radius: 5px;
  }
</style>

<div class="gallery">
  {#each images as img (img.id)}
    <div class="image-container">
      <img src={img.url} alt="Uploaded image" on:click={() => openImage(img.url, img.id)} />
    </div>
  {/each}
</div>

{#if selectedImage}
  <div class="preview" on:click={closePreview}>
    <img src={selectedImage} alt="Preview" />
    <button on:click={() => deleteImage(selectedImageId)}>Delete</button>
  </div>
{/if}
