import axios from "axios";
import { showAlert } from "./alert";

export const signup = async function (data) {
    console.log(data)
    try {
      const response = await axios({
        method: 'POST',
        url: `http://localhost:4000/api/v1/users/signup`,
        data:data
      });
      if (response.data.status === 'success') {
        showAlert('success', 'Your account is created');
        window.setTimeout(() => {
          location.assign('/');
        }, 2500);
      }
      console.log(response);
    } catch (error) {
      showAlert('error', `error`);
      console.log(error)
    }
  };