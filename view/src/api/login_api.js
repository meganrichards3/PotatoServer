import axios from 'axios'

// returns token for successful login, 401 for failure
export default async function loginUser(credentials) {
    let token = await axios.post('http://localhost:3000/', {
      username: credentials.username,
      password: credentials.password
    }); 
    return token
  }


