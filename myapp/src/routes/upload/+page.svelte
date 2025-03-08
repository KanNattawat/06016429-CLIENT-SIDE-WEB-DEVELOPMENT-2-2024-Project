<script>
    import { onMount } from "svelte";
    import { user, fetchUser } from "../../stores/gallery";
    let files = [];
    let name = "";
    let description = "";
    let category = ""; // Category ID
    let categories = [
        { id: 1, name: "Nature" },
        { id: 2, name: "Animals" },
        { id: 3, name: "Technology" },
        { id: 4, name: "Architecture" },
        { id: 5, name: "Food" },
    ];
    onMount(fetchUser);
    console.log($user.id);

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
        for (let file of files) {
            formData.append("images", file);
        }

        if (files.length === 1 && name.trim() === "") {
            alert("Please enter a name for the file.");
            return;
        }
        formData.append("filename", name);
        formData.append("description", description);

        if (!category) {
            // Ensure category ID is selected
            alert("Please select a category.");
            return;
        }
        formData.append("category", category); // Send category ID
        formData.append("owner_email", $user.email);

        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            alert("Upload Success!");
            files = [];
            name = "";
            description = "";
            category = ""; // Reset the category field
            // Redirect to the gallery page after success
            window.location.href = "http://localhost:5173/"; // Assuming '/gallery' is your gallery page route
        } else {
            alert("Upload failed. Please try again.");
        }
    }

    function handleFileChange(event) {
        files = Array.from(event.target.files);
    }
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
    <form
        class="bg-white p-6 rounded-lg shadow-md w-96"
        on:submit={handleUpload}
    >
        <h2 class="text-xl font-semibold mb-4 text-center">Upload Images</h2>

        <label for="img" class="block text-sm font-medium text-gray-700"
            >Select Images</label
        >
        <input
            id="img"
            class="upload mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            type="file"
            multiple
            accept="image/*"
            on:change={handleFileChange}
        />

        {#if files.length === 1}
            <div class="mt-4">
                <label
                    for="name"
                    class="block text-sm font-medium text-gray-700"
                    >File Name</label
                >
                <input
                    type="text"
                    id="name"
                    placeholder="Enter file name"
                    bind:value={name}
                    class="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
                />
                <label
                    for="description"
                    class="block text-sm font-medium text-gray-700 mt-2"
                    >Description</label
                >
                <textarea
                    id="description"
                    rows="4"
                    bind:value={description}
                    class="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
                ></textarea>
                <label
                    for="category"
                    class="block text-sm font-medium text-gray-700 mt-2"
                    >Category</label
                >
                <select
                    id="category"
                    bind:value={category}
                    class="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
                >
                    <option value="" disabled selected>Select a category</option
                    >
                    {#each categories as categoryItem}
                        <option value={categoryItem.id}
                            >{categoryItem.name}</option
                        >
                        <!-- Use category ID here -->
                    {/each}
                </select>
            </div>
        {/if}
        {#if files.length > 1}
            <label
                for="category"
                class="block text-sm font-medium text-gray-700 mt-2"
                >Category</label
            >
            <select
                id="category"
                bind:value={category}
                class="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            >
                <option value="" disabled selected>Select a category</option>
                {#each categories as categoryItem}
                    <option value={categoryItem.id}>{categoryItem.name}</option>
                    <!-- Use category ID here -->
                {/each}
            </select>
        {/if}

        <button
            type="submit"
            class="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
            >Submit</button
        >
    </form>
</div>
