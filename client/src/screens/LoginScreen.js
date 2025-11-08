<!DOCTYPE html>
<html>
<head>
  <title>Login Page</title>
  <style>
    body {
      img {
      width: 450px;             /* adjust size */
      margin-bottom: 20px;      /* space between image and form */
    }

      background-color: black;
      color: white; 
      
      display: grid;
      place-items: center;  
      height: 100vh;
      margin: 0;
        
    }
    
    .login-form {
      width: 300px;
      padding: 20px;
      background: #222;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 10px; 
    }

    .login-form input,
    .login-form button {
      padding: 10px;
      border: none;
      border-radius: 4px;
    }

    .login-form button {
      background: #555;
      color: white;
      cursor: pointer;
    }

    .login-form button:hover {
      background: #777;
    }

  </style>

</head>
<body>
  <img src="Walkbound_logo.png" alt="Site Logo">


  <form class="login-form">
    <input type="text" placeholder="Username">
    <input type="password" placeholder="Password">
    <button type="submit">Login</button>
    <div class="create-account">
      <p> <a href="register.html">Create an account</a></p> 
    </div>

  </form>
  <script src="login.js"></script>
</body>
</html>

function LoginScreen = () {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleLogin() {
        if (!password || !email) {
            // Error
            return;
        }
        //...
    }
}