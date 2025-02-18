<script>
    async function handleUpload(event) {
        event.preventDefault(); // Prevent default form submission behavior

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

        // If only one file is selected, add the name input value
        if (files.length === 1 && nameInput) {
            if (nameInput.value.trim() === "") {
                alert("Please enter a name for the file.");
                return;
            }
            formData.append("filename", nameInput.value);
            formData.append("description", desInput.value);
        }

        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        alert("Upload Success!");
        input.value = "";
        checkFileAmount(); // Reset name field if needed
        window.location.href = "http://localhost:5173";
    }

    function checkFileAmount() {
        const input = document.querySelector(".upload");
        const file_amount = input.files.length;
        const nameFieldContainer = document.getElementById("nameField");

        if (file_amount === 1) {
            if (!nameFieldContainer) {
                const newField = document.createElement("div");
                newField.id = "nameField";
                newField.innerHTML = `
                    <label for="name">Name</label>
                    <input type="text" id="name" placeholder="Enter file name">
                    <label for="description">Description</label>
                    <textarea id="description" rows="4" cols="50"></textarea>
                `;
                document.querySelector("form").insertBefore(newField, document.querySelector("button"));
            }
        } else {
            if (nameFieldContainer) {
                nameFieldContainer.remove();
            }
        }
    }
</script>

<form on:submit={handleUpload}>
    <label for="img">Upload Images</label>
    <input id="img" class="upload" type="file" multiple accept="image/*" on:change={checkFileAmount}>
    <br>
    <button type="submit">Submit</button>
</form>
