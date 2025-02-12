<script>
    async function handleUpload() {
        const input = document.querySelector(".upload");
        const files = input.files;

        if (files.length === 0) {
            alert("Please select files to upload.");
            return;
        }

        const formData = new FormData();
        for (let file of files) {
            formData.append("images", file);
        }

        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        alert("Upload Success!");
        input.value = "";
        window.location.href = "http://localhost:5173";
    }
</script>

<input class="upload" type="file" multiple accept="image/*" />
<button on:click={handleUpload}>Upload</button>
