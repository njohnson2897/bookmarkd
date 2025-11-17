import { jwtDecode as decode } from 'jwt-decode';

class AuthService {
  getProfile() {
    const token = this.getToken();
    return token ? decode(token) : null;
  }

  loggedIn() {
    const token = this.getToken();
    // If there is a token and it's not expired, return `true`
    return token && !this.isTokenExpired(token) ? true : false;
  }

  isTokenExpired(token) {
    try {
      // Decode the token to get its expiration time that was set by the server
      const decoded = decode(token);
      // If the expiration time is less than the current time (in seconds), the token is expired and we return `true`
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem('id_token');
        return true;
      }
      // If token hasn't passed its expiration time, return `false`
      return false;
    } catch (err) {
      return true;
    }
  }

  getToken() {
    return localStorage.getItem('id_token');
  }

  login(idToken) {
    localStorage.setItem('id_token', idToken);
    const decoded = decode(idToken);
    window.location.assign(`/profile/${decoded.data._id}`);
  }

  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

export default new AuthService();

