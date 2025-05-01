import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadImage from "../components/UploadImage";

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    nic: "",
    jobPosition: "Manager",
    age: "",
    jobStartDate: "",
    imageUrl: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validatePhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Accepts:
    // - 10 digits starting with 0 (0712345678)
    // - 9 digits after country code (712345678)
    return /^(0\d{9}|[1-9]\d{8})$/.test(cleaned);
  };
  const validateNIC = (nic) => {
    return /^\d{9}[VvXx]$|^\d{12}$/.test(nic);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phoneNumber") {
      const cleanedValue = value.replace(/[^0-9]/g, '');
      setForm({ ...form, [name]: cleanedValue });
      return;
    }
    
    if (name === "age" && Number(value) < 0) return;
    
    setForm({ ...form, [name]: value });
  };

  const formatDateForBackend = (dateString) => {
    if (!dateString) return "";
    
    // Handle both MM/DD/YYYY and YYYY-MM-DD formats
    const parts = dateString.split(/[/-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) { // YYYY-MM-DD format
        return dateString;
      } else { // MM/DD/YYYY format
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
    }
    return dateString;
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setError("");

    // Validate all fields
    if (!form.firstName || !form.lastName || !form.email || !form.password || 
        !form.phoneNumber || !form.nic || !form.jobPosition || !form.age || !form.jobStartDate) {
      setError("All required fields must be provided");
      return;
    }

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePhoneNumber(form.phoneNumber)) {
      setError("Please enter a valid 10-digit Sri Lankan phone number starting with 0 (e.g., 0712345678)");
      return;
    }

    if (!validateNIC(form.nic)) {
      setError("Invalid NIC format. NIC should be 9 digits followed by a letter (V/X) or 12 digits.");
      return;
    }

    if (form.age < 18 || form.age > 100) {
      setError("Age must be between 18 and 100");
      return;
    }

    if (!form.imageUrl) {
      setError("Please upload a profile image");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = formatDateForBackend(form.jobStartDate);
      
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email.toLowerCase(), // normalize email
        password: form.password,
        phoneNumber: form.phoneNumber, // send as string
        nic: form.nic,
        jobPosition: form.jobPosition,
        age: Number(form.age), // ensure age is number
        jobStartDate: formattedDate,
        imageUrl: form.imageUrl
      };

      console.log("Sending payload:", payload);

      const response = await fetch("http://localhost:4000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok) {
        const errorMsg = data.message || 
                       (data.errors ? JSON.stringify(data.errors) : "Registration failed");
        throw new Error(errorMsg);
      }

      alert("Successfully Registered!");
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Error during registration. Please check the details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (image) => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "inventoryapp");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/ddhayhptm/image/upload", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (result.url) {
        setForm({ ...form, imageUrl: result.url });
        alert("Image Successfully Uploaded");
      } else {
        throw new Error("Failed to get image URL");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setError("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <img className="mx-auto h-16 w-auto" src={require("../assets/logo.png")} alt="Your Company" />
          <h2 className="mt-4 text-2xl font-semibold text-gray-800">Employee Registration</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={registerUser}>
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="First Name"
                value={form.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={form.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                minLength="6"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +94
                </span>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder="712345678"
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  maxLength="9"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter your 9-digit mobile number (without the 0)
              </p>
            </div>

            <div>
              <label htmlFor="nic" className="block text-sm font-medium text-gray-700">NIC</label>
              <input
                id="nic"
                name="nic"
                type="text"
                required
                placeholder="NIC (e.g., 123456789V or 123456789012)"
                value={form.nic}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="jobPosition" className="block text-sm font-medium text-gray-700">Job Position</label>
              <select
                id="jobPosition"
                name="jobPosition"
                required
                value={form.jobPosition}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Manager">Manager</option>
                <option value="Factory Worker">Factory Worker</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                required
                placeholder="Age"
                value={form.age}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="18"
                max="100"
              />
            </div>

            <div>
              <label htmlFor="jobStartDate" className="block text-sm font-medium text-gray-700">Job Start Date</label>
              <input
                id="jobStartDate"
                name="jobStartDate"
                type="date"
                required
                value={form.jobStartDate}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <UploadImage uploadImage={uploadImage} />
            {form.imageUrl && (
              <div className="flex items-center">
                <span className="text-green-600 text-sm">✓ Image uploaded successfully</span>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Sign up"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-center sm:order-last">
        <img src={require("../assets/Login.png")} alt="Illustration" />
      </div>
    </div>
  );
}

export default Register;