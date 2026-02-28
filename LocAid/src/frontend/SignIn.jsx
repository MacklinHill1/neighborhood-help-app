import React, {useState} from "react";


export default function SignIn() {
    const [UserName, setUsername] = useState("")
    const[Password, setPassword] = useState("")

    const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Username:", UserName);
    console.log("Password:", Password);
  };

  return (
    <main>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div>
            <label>Username:</label>
        <input
        type="text"
        value = {UserName}
        onChange={(e) => setUsername(e.target.value)}
        placeholder = "Enter Username"
        required
        />
        <div>
          <label>Password:</label>
          <input
            type="text"
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            required
          />
        </div>

        <button type="submit">Submit</button>
        </div>
        <div></div>
      </form>

      {/* Your form goes here */}
    </main>
  );
}