    export const watTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true // Set to false for 24-hour format
    });

    export const buildOrderString = (selectedItem:any, selectedModifiers:any) => {
      if (!selectedItem) return ''
      const base = selectedItem.name
      if (selectedModifiers.length === 0) return base
      const modifierParts = selectedModifiers.map((m) => `${m.qty} ${m.name}`)
      return `${base} + ${modifierParts.join(' + ')}`
    }

    export const formatNaira = (amount:number) => {
  return '₦' + Number(amount).toLocaleString('en-NG');
}


export const convertTo12Hour = (time24: string) => {
  const [hours] = time24.split(".").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${formattedHours} ${period}`;
};


export function nairaToKobo(naira: number) {
  if (isNaN(naira) || naira < 0) {
    throw new Error("Please enter a valid positive number");
  }
  // Math.round fixes JS floating-point arithmetic quirks
  return Math.round(naira * 100);
}


