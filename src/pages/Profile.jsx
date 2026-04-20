import { useState } from "react";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";

function Profile() {
  const { user, userName, updateUserName } = useAuth();

  const [name, setName] = useState(userName || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await updateUserName(name);
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div
        style={{
          maxWidth: "500px",
          margin: "auto",
          padding: "20px",
        }}
      >
        <h2>Profile</h2>

        <form onSubmit={handleSave} style={{ marginTop: "20px" }}>
          <label>Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              marginBottom: "10px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "8px 15px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>

          {message && (
            <p style={{ marginTop: "10px", color: "green" }}>{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Profile;
