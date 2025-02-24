<script>
    async function handleUpload(event) {
        event.preventDefault();
        const input = document.querySelector(".upload");
        const files = input.files;
        const nameInput = document.getElementById("name");
        const desInput = document.getElementById("description");

        if (files.length === 0) {
            alert("Please select files to upload.");
            return;
        }

        const formData = new FormData();
        for (let file of files) {
            formData.append("images", file);
        }

        if (files.length === 1 && nameInput) {
            if (nameInput.value.trim() === "") {
                alert("Please enter a name for the file.");
                return;
            }
            formData.append("filename", nameInput.value);
            formData.append("description", desInput.value);
        }

        await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        alert("Upload Success!");
        input.value = "";
        checkFileAmount();
        window.location.href = "http://localhost:5173";
    }

    function checkFileAmount() {
        const input = document.querySelector(".upload");
        const file_amount = input.files.length;
        const nameFieldContainer = document.getElementById("nameField");

        if (file_amount === 1) {
            if (!nameFieldContainer.innerHTML) {
                nameFieldContainer.innerHTML = `
                    <div class="mt-4">
                        <label for="name" class="block text-sm font-medium text-gray-700">File Name</label>
                        <input type="text" id="name" placeholder="Enter file name" class="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300">
                        <label for="description" class="block text-sm font-medium text-gray-700 mt-2">Description</label>
                        <textarea id="description" rows="4" class="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"></textarea>
                    </div>
                `;
            }
        } else {
            nameFieldContainer.innerHTML = "";
        }
    }
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
    <form class="bg-white p-6 rounded-lg shadow-md w-96" on:submit={handleUpload}>
        <h2 class="text-xl font-semibold mb-4 text-center">Upload Images</h2>
        
        <label for="img" class="block text-sm font-medium text-gray-700">Select Images</label>
        <input id="img" class="upload mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300" type="file" multiple accept="image/*" on:change={checkFileAmount}>
        
        <div id="nameField"></div>
        
        <button type="submit" class="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow">Submit</button>
    </form>
</div>