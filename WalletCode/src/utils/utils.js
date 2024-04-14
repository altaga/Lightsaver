import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

export async function getAsyncStorageValue(label) {
  try {
    const session = await AsyncStorage.getItem('General');
    if (label in JSON.parse(session)) {
      return JSON.parse(session)[label];
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

export async function setAsyncStorageValue(value) {
  const session = await AsyncStorage.getItem('General');
  await AsyncStorage.setItem(
    'General',
    JSON.stringify({
      ...JSON.parse(session),
      ...value,
    }),
  );
}

export async function getEncryptedStorageValue(label) {
  try {
    const session = await EncryptedStorage.getItem('General');
    if (label in JSON.parse(session)) {
      return JSON.parse(session)[label];
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

export async function setEncryptedStorageValue(value) {
  const session = await EncryptedStorage.getItem('General');
  await EncryptedStorage.setItem(
    'General',
    JSON.stringify({
      ...JSON.parse(session),
      ...value,
    }),
  );
}

export async function eraseStorageFull() {
  // Debug Only
  try {
    await EncryptedStorage.clear();
    await AsyncStorage.clear();
  } catch (error) {
    console.log(error);
  }
}

export function arraySum(array) {
  return array.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
}

export function epsilonRound(num, zeros = 4) {
  let temp = num;
  if (typeof num === 'string') {
    temp = parseFloat(num);
  }
  return (
    Math.round((temp + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}

export function formatDate(date) {
  // Array of month names
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Get the day, month, and year from the date object
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  // Format the date in the desired format
  const formattedDate = `${monthNames[monthIndex]} / ${
    day < 10 ? '0' : ''
  }${day} / ${year}`;

  return formattedDate;
}

export function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function deleteLeadingZeros(string) {
  let number = parseFloat(string);
  let formattedString = number.toFixed(2).toString();
  return formattedString;
}

function isNumber(string) {
  return !isNaN(parseFloat(string)) && isFinite(string);
}

export function formatInputText(inputText) {
  if (
    inputText === '0.00' ||
    inputText === '0' ||
    inputText === '00' ||
    inputText === '.' ||
    inputText === ''
  ) {
    return '0.00';
  } else if (isNumber(inputText) && !inputText.includes('.')) {
    return inputText + '.00';
  } else {
    let zeroAttached = '';
    if (inputText.includes('.')) {
      if (inputText.split('.')[0].length === 0) {
        zeroAttached = '0';
      }
      if (inputText.split('.')[1].length > 2) {
        return (
          zeroAttached +
          inputText.split('.')[0] +
          '.' +
          inputText.split('.')[1].substring(0, 2)
        );
      } else if (inputText.split('.')[1].length === 2) {
        return zeroAttached + inputText;
      } else if (inputText.split('.')[1].length === 1) {
        return zeroAttached + inputText + '0';
      } else {
        return zeroAttached + inputText + '00';
      }
    } else {
      return zeroAttached + inputText + '.00';
    }
  }
}