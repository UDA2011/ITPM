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
    jobPosition: "",
    age: "",
    jobStartDate: "",
    imageUrl: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateNIC = (nic) => {
    return /^\d{9}[VvXx]$|^\d{12}$/.test(nic);
  };

  const registerUser = () => {
    if (!validateNIC(form.nic)) {
      alert("Invalid NIC format. NIC should be 9 digits followed by a letter (V/X) or 12 digits.");
      return;
    }

    fetch("http://localhost:4000/api/register", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(form),
    })
      .then((result) => {
        alert("Successfully Registered, Now Login with your details");
        navigate("/login");
      })
      .catch((err) => console.log(err));
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center">
        <div className="w-full max-w-md space-y-8 p-10 rounded-lg">
          <div>
            <img className="mx-auto h-12 w-auto" src={require("../assets/logo.png")} alt="Your Company" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Employee Registration </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <input name="firstName" type="text" required placeholder="First Name" value={form.firstName} onChange={handleInputChange} className="input-field" />
                <input name="lastName" type="text" required placeholder="Last Name" value={form.lastName} onChange={handleInputChange} className="input-field" />
              </div>
              <input name="email" type="email" required placeholder="Email address" value={form.email} onChange={handleInputChange} className="input-field" />
              <input name="password" type="password" required placeholder="Password" value={form.password} onChange={handleInputChange} className="input-field" />
              <input name="phoneNumber" type="number" required placeholder="Phone Number" value={form.phoneNumber} onChange={handleInputChange} className="input-field" />
              <input name="nic" type="text" required placeholder="NIC" value={form.nic} onChange={handleInputChange} className="input-field" />
              <input name="jobPosition" type="text" required placeholder="Job Position" value={form.jobPosition} onChange={handleInputChange} className="input-field" />
              <input name="age" type="number" required placeholder="Age" value={form.age} onChange={handleInputChange} className="input-field" />
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
    </>
  );
}

export default Register;
