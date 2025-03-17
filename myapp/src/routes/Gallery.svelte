<script>
  import { onMount, onDestroy } from "svelte";
  import {
    user, images, selectedImage, selectedImageId,
    comments, commentText, favorites, slide, showSlideshow, currentIndex,
    fetchUser, fetchImages, fetchComments, fetchFavorites, fetchSlideImage,
    openImage, closePreview, handleEditImage, handleDeleteImage,
    handleAddComment, toggleFavorite, toggleFullscreen,
    startSlideshow, stopSlideshow, handleSlide,
  } from "../stores/gallery";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { fade } from "svelte/transition";

  export let filter = "files";

  onMount(() => {
    if (browser) {
      fetchUser();
      fetchImages(filter);
      fetchComments();
      fetchFavorites();
      fetchSlideImage(filter);
      window.addEventListener("keydown", handleSlide);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("keydown", handleSlide);
    }
  })
</script>

<button on:click={startSlideshow} class="bg-gray-700 text-white px-4 py-2 rounded">Fullscreen Slideshow</button>

{#if $images}
  <div class="masonry p-5">
    {#each $images as img (img.id)}
      <div
        class="cursor-pointer transition-transform transform hover:scale-105"
        role="button"
        tabindex="0"
        on:click={() =>
          openImage(
            img.url,
            img.id,
            img.name,
            img.description,
            img.category,
            img.owner_email,
          )}
          on:keydown={(event) => { if (event.key === "Enter") 
          openImage(
            img.url,
            img.id,
            img.name,
            img.description,
            img.category,
            img.owner_email); }}
      >
        <img
          class="w-full h-auto rounded-lg"
          src={img.url}
          alt={"Uploaded image"}
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

      <div
        class="pt-18 cursor-pointer"
        role="button"
        tabindex="0"
        on:click={() => toggleFullscreen()}
        on:keydown={(event) => { if (event.key === "Enter") toggleFullscreen(); }}>
          <img src={$selectedImage.url}
          class="h-[calc(75vh)] w-fit mt-4"
          alt="Preview"
          id="pre_img" />
      </div>

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

        {#if $user}
          <button
            class="absolute right-15 bg-gray-800 rounded-lg hover:bg-gray-900 mt-16"
            on:click|stopPropagation={() => toggleFavorite($selectedImageId)}>
            {#if $favorites.has($selectedImageId)}
              ❤️ Favorite
            {:else}
              🤍 Add To Favorite
            {/if}
          </button>
        {/if}

        <p class="text-gray-300 pt-6 text-l">
          Category <span class="font-semibold">{$selectedImage.category}</span>
        </p>

        <hr class="my-4 border-gray-600" />
        <p class="leading-relaxed text-md text-center p-5">{$selectedImage.description ? $selectedImage.description : "No description provided."}</p>

        <hr class="my-4 border-gray-600" />
        <div class="mt-5">
          <h3 class="text-3xl font-semibold">Comments</h3>
          <br />
          {#if $user}
            <textarea
              class="w-full h-30 p-4 mt-3 border rounded bg-gray-800 text-white placeholder-gray-400"
              bind:value={$commentText}
              placeholder="Add comment ..."
            ></textarea>
            <div class="flex justify-end mt-2 pb-8">
              <button
                class="mt-2 px-4 py-2 bg-blue-500 text-white rounded flex"
                on:click={handleAddComment}>Add Comment</button
              >
            </div>
          {:else}
            <textarea
              class="w-full h-30 p-4 my-5 border rounded bg-gray-800 text-white placeholder-gray-400 cursor-text"
              placeholder="Please login before adding comment ..."
              disabled
            ></textarea>
          {/if}
          {#each $comments as cm}
            <p class="mt-2 text-lg flex items-center gap-x-2">
              ▪ <img src={($user && cm.user_email === $user.email) ? $user.picture : (cm.userImg || "../../anonymous-icon.jpg")} alt={"Profile Picture"} class="w-9 h-9 rounded-full border-2 border-indigo-600">
              <span class="font-semibold">{cm.username}</span>
              <span class="text-gray-500 text-sm">
                {new Date(cm.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }) + " " + new Date(cm.created_at).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </p>
            <p class="mt-3 ml-15 text-md">{cm.comment}</p>
          {/each}
          <br />
        </div>
      </div>
    </div>
  {/if}

  {#if $showSlideshow}
    <div class="fixed inset-0 bg-black flex items-center justify-center">
      {#if $slide.length > 0}
      <div
      role="button"
      tabindex="0"
      on:click={stopSlideshow}
      on:keydown={handleSlide}>
      <img
        src={$slide[$currentIndex]}
        alt={"Slideshow image"}
        class="h-100vh w-fit object-contain"
        transition:fade={{ duration: 500 }}
      />
    </div>
      {:else}
        <p class="text-white">Loading images...</p>
      {/if}
    </div>
  {/if}
{/if}
