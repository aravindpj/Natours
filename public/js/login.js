import axios from 'axios';
import { showAlert } from './alert';

export const login = async function (email, password) {
  try {
    const response = await axios({
      method: 'POST',
      url: `http://localhost:4000/api/v1/users/login`,
      data: {
        email,
        password,
      },
    });
    if (response.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 2500);
    }
    console.log(response);
  } catch (error) {
    showAlert('error', `${error.response.data.message}`);
  }
};

export const logout = async function () {
  try {
    const response = await axios({
      method: 'GET',
      url: `http://localhost:4000/api/v1/users/logout`,
    });
    if(response.data.status==='success') location.reload(true)
  } catch (error) {
      showAlert('error','Error: cannot logout this time')
  }
};
