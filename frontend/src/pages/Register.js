import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadImage from "../components/UploadImage";

function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    nic: "",
    jobPosition: "Manager",
    age: "",
    jobStartDate: "",
    imageUrl: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if ((name === "phoneNumber" || name === "age") && Number(value) < 0) return;
    setForm({ ...form, [name]: value });
  };

  const validateNIC = (nic) => {
    return /^\d{9}[VvXx]$|^\d{12}$/.test(nic);
  };

  const registerUser = () => {
    if (!validateNIC(form.nic)) {
      alert("Invalid NIC format. NIC should be 9 digits followed by a letter (V/X) or 12 digits.");
      return;
    }

    let employees = JSON.parse(localStorage.getItem("employees")) || [];
    employees.push(form);
    localStorage.setItem("employees", JSON.stringify(employees));

    alert("Successfully Registered!");
    navigate("/");
  };

  const uploadImage = async (image) => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "inventoryapp");

    await fetch("https://api.cloudinary.com/v1_1/ddhayhptm/image/upload", {
      method: "POST",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({ ...form, imageUrl: data.url });
        alert("Image Successfully Uploaded");
      })
      .catch((error) => console.log(error));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <img className="mx-auto h-16 w-auto" src={require("../assets/logo.png")} alt="Your Company" />
          <h2 className="mt-4 text-2xl font-semibold text-gray-800">Employee Registration</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleInputChange}
                className="input-field"
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
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                value={form.password}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="nic" className="block text-sm font-medium text-gray-700">NIC</label>
              <input
                id="nic"
                name="nic"
                type="text"
                required
                placeholder="NIC"
                value={form.nic}
                onChange={handleInputChange}
                className="input-field"
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
                className="input-field"
              >
                <option value="Manager">Manager</option>
                <option value="Factory Worker">Factory Worker</option>
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
                className="input-field"
                min="0"
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
                className="input-field"
              />
            </div>

            <UploadImage uploadImage={uploadImage} />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
              onClick={registerUser}
            >
              Sign up
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
