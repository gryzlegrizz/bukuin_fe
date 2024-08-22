import { endpointCreateBook } from "./url.js";

document
    .getElementById("addBookBtn")
    .addEventListener("click", async function (event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const description = document.getElementById("description").value;
        const launch_year = parseInt(document.getElementById("launch_year").value, 10);
        const isbn = document.getElementById("isbn").value;
        const cover_image_url = document.getElementById("cover_image_url").value;

        if (!title || !author || !description || !launch_year || !isbn || !cover_image_url) {
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Please fill all fields",
            });
            return;
        }

        try {
            const user = await getUserData();
            if (!user.id_user) {
                throw new Error("User ID not found");
            }

            postData(title, author, description, launch_year, isbn, cover_image_url, user.id_user);
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed to add book",
                text: error.message,
            });
        }
    });

    function postData(title, author, description, launch_year, isbn, cover_image_url, id_user) {
        const url = endpointCreateBook;
        const token = localStorage.getItem("LOGIN");
    
        const newData = {
            title: title,
            author: author,
            description: description,
            launch_year: launch_year,
            isbn: isbn,
            cover_image_url: cover_image_url,
            id_user: id_user,
        };
    
        console.log("Sending data:", newData); // Log the data being sent
    
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                LOGIN: `${token}`,
            },
            body: JSON.stringify(newData),
        })
        .then(handleResponse)
        .catch(handleError);
    }
    
    function handleResponse(response) {
        if (!response.ok) {
            return response.json().then((data) => {
                throw new Error(data.message || "Network error");
            });
        }
        return response.json().then((data) => {
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Data added successfully",
                confirmButtonText: "See dashboard",
                showCancelButton: true,
                cancelButtonText: "Stay in this page",
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "/dashboard-admin.html";
                }
            });
        });
    }

    function handleError(error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Failed to add book",
            text: error.message,
        });
    }

    async function getUserData() {
        const token = localStorage.getItem("LOGIN");
        try {
            const response = await fetch("http://127.0.0.1:3000/auth", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    LOGIN: `${token}`,
                },
            });
    
            // Check if the response is in JSON format
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(text);
            }
    
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch user data");
            }
            return data.user;
        } catch (error) {
            console.error("Error fetching user data:", error);
            Swal.fire({
                icon: "error",
                title: "Failed to get user data",
                text: error.message,
            });
    
            if (error.message === "Token is expired") {
                // Redirect to the login page or clear the expired token
                localStorage.removeItem("LOGIN");
                window.location.href = "login.html";
            }
    
            throw error;
        }
    }
    

    