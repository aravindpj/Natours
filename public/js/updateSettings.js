import axios from 'axios';
import { showAlert } from './alert';

export const updateSetting = async function (data, type) {
  const url =
    type === 'password'
      ? 'http://localhost:7000/api/v1/users/updatePassword'
      : 'http://localhost:7000/api/v1/users/updateMe';

  try {
    const updatedUser = await axios({
      method: 'PATCH',
      url,
      data: data
    });
    if (updatedUser.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (error) {
    showAlert('error', `${error.response.data.message}`);
    console.log(error);
  }
};
