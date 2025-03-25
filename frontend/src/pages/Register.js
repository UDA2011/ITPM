import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    navigate("/managers"); // Redirect to Managers page
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
    <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center">
      <div className="w-full max-w-md space-y-8 p-10 rounded-lg">
        <div>
          <img className="mx-auto h-12 w-auto" src={require("../assets/logo.png")} alt="Your Company" />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Employee Registration</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label>Full Name</label>
              <div className="flex gap-4">
                <input name="firstName" type="text" required placeholder="First Name" value={form.firstName} onChange={handleInputChange} className="input-field" />
                <input name="lastName" type="text" required placeholder="Last Name" value={form.lastName} onChange={handleInputChange} className="input-field" />
              </div>
            </div>
            <label>Email</label>
            <input name="email" type="email" required placeholder="Email address" value={form.email} onChange={handleInputChange} className="input-field" />
            <label>Password</label>
            <input name="password" type="password" required placeholder="Password" value={form.password} onChange={handleInputChange} className="input-field" />
            <label>Phone Number</label>
            <input name="phoneNumber" type="tel" required placeholder="Phone Number" value={form.phoneNumber} onChange={handleInputChange} className="input-field" />
            <label>NIC</label>
            <input name="nic" type="text" required placeholder="NIC" value={form.nic} onChange={handleInputChange} className="input-field" />
            <label>Job Position</label>
            <select name="jobPosition" required value={form.jobPosition} onChange={handleInputChange} className="input-field">
              <option value="Manager">Manager</option>
              <option value="Factory Worker">Factory Worker</option>
            </select>
            <label>Age</label>
            <input name="age" type="number" required placeholder="Age" value={form.age} onChange={handleInputChange} className="input-field" min="0" />
            <label>Job Start Date</label>
            <input name="jobStartDate" type="date" required value={form.jobStartDate} onChange={handleInputChange} className="input-field" />
            <UploadImage uploadImage={uploadImage} />
          </div>
          <div>
            <button type="submit" className="btn" onClick={registerUser}>Sign up</button>
          </div>
        </form>
      </div>
      <div className="flex justify-center order-first sm:order-last">
        <img src={require("../assets/Login.png")} alt="" />
      </div>
    </div>
  );
}

export default Register;