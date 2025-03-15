<script>
    import { onMount } from "svelte";
    import { user, fetchUser } from "../../stores/gallery";
    import Navbar from "../navbar.svelte";
    
    let files = [];
    let name = "";
    let description = "";
    let category = "";
    let visibility = "Public";
    let dragging = false;
    
    let categories = [
        { id: 1, name: "Nature" },
        { id: 2, name: "Animals" },
        { id: 3, name: "Technology" },
        { id: 4, name: "Architecture" },
        { id: 5, name: "Food" },
    ];

    onMount(fetchUser);

    async function handleUpload(event) {
        event.preventDefault();

        if (!$user) {
            alert("User not authenticated. Please log in.");
            return;
        }

        if (files.length === 0) {
            alert("Please select files to upload.");
            return;
        }

        const formData = new FormData();
        files.forEach(file => formData.append("images", file));

        if (files.length === 1 && name.trim() === "") {
            alert("Please enter a name for the file.");
            return;
        }

        formData.append("filename", name);
        formData.append("description", description);

        if (!category) {
            alert("Please select a category.");
            return;
        }
        
        formData.append("category", category);
        formData.append("owner_email", $user.email);
        formData.append("visibility", visibility);

        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            alert("Upload Success!");
            files = [];
            name = "";
            description = "";
            category = "";
            visibility = "Public";
            window.location.href = "http://localhost:5173/";
        } else {
            alert("Upload failed. Please try again.");
        }
    }

    function handleClick(event) {
        let fileInput = document.getElementById("fileInput");
        fileInput.value = "";
        fileInput.click();
    }

    function handleFileChange(event) {
        files = [...event.target.files];
    }

    function handleDrop(event) {
        event.preventDefault();
        dragging = false;
        files = [...event.dataTransfer.files];
    }

    function handleDragOver(event) {
        event.preventDefault();
        dragging = true;
    }

    function handleDragLeave() {
        dragging = false;
    }
</script>

<Navbar />

<div class="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-10 bg-gray-900">
    <form class="bg-white p-6 rounded-lg shadow-md w-96" on:submit={handleUpload}>
        <a href="http://localhost:5173/"><button class="py-2 px-4 rounded-xl border-2 text-white bg-blue-600 border-blue-800 hover:bg-blue-800">Back</button></a>
        <h2 class="text-xl font-semibold mb-4 text-center">Upload Images</h2>

        <div
            role="button" 
            tabindex="0" 
            aria-label="Upload Files"
            class="group border-2 border-dashed rounded-lg p-6 text-center cursor-pointer relative hover:bg-gray-300"
            class:border-blue-500={dragging}
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            on:drop={handleDrop}
            on:click={handleClick}
            on:keypress={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    let fileInput = document.getElementById("fileInput");
                    fileInput.value = "";
                    fileInput.click();
                }
            }}
        >
        {#if files.length}
        <div class="flex flex-wrap gap-2 justify-center">
            {#each files as file}
                <div class="relative">
                    <img src={URL.createObjectURL(file)} alt="Uploaded Image" class="w-auto object-cover rounded-lg shadow-md border" />
                </div>
            {/each}
        </div>
        {:else}
            <p class="text-gray-600">Drag & drop files here or <span class="text-blue-500 underline group-hover:text-blue-800">click to select</span></p>
            <input 
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                on:change={handleFileChange}
            />
        {/if}
        </div>

        {#if files.length}
            <ul class="mt-4 text-sm text-center text-gray-700">
                {#each files as file}
                    <li class="overflow-auto py-2">File: {file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                    <hr>
                {/each}
            </ul>
        {/if}

        {#if files.length === 1}
            <label class="block mt-4 text-sm font-medium text-gray-700">File Name</label>
            <input type="text" bind:value={name} class="p-2 w-full border rounded-md" />

            <label class="block mt-2 text-sm font-medium text-gray-700">Description</label>
            <textarea bind:value={description} rows="4" class="p-2 w-full border rounded-md"></textarea>

            <label class="block mt-2 text-sm font-medium text-gray-700">Category</label>
            <select bind:value={category} class="p-2 w-full border rounded-md">
                <option value="" disabled selected>Select a category</option>
                {#each categories as categoryItem}
                    <option value={categoryItem.name}>{categoryItem.name}</option>
                {/each}
            </select>
        {/if}

        {#if files.length > 1}
            <label class="block mt-4 text-sm font-medium text-gray-700">Category</label>
            <select bind:value={category} class="p-2 w-full border rounded-md">
                <option value="" disabled selected>Select a category</option>
                {#each categories as categoryItem}
                    <option value={categoryItem.name}>{categoryItem.name}</option>
                {/each}
            </select>
        {/if}

        {#if files.length}
            <div>
                <label>
                    <input type="radio" bind:group={visibility} value="Public" checked>Public
                </label>
                <label>
                    <input type="radio" bind:group={visibility} value="Private">Private
                </label>
            </div>
        {/if}

        <button type="submit" class="w-full mt-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg">
            Submit
        </button>
    </form>
</div>
