export const formatDate = (dateInput: string | Date, time: boolean = false) => {
  let date: Date;
  if (typeof dateInput === 'string'){
    date = new Date(dateInput)
  } else {
    date = dateInput
  }

  if (time) {
    return date.toLocaleString();
  }
  return date.toLocaleDateString();
};


export const formatNumber = (value: any,): string => {
  const number = parseFloat(value);
  if (isNaN(number)) {
    return '0.00';  
  }
  return number.toFixed(2);
};