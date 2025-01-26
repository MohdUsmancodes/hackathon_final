import QRCode from 'qrcode';

export const generateBookingQRCode = (userId, serviceId, timestamp) => {
  // Take first 4 chars of each component
  const shortUserId = userId.slice(0, 4);
  const shortServiceId = serviceId.slice(0, 4);
  const shortTimestamp = timestamp.toString().slice(-4);
  // Combine them into a short unique code
  return `${shortUserId}-${shortServiceId}-${shortTimestamp}`;
};

export const generateQRCode = async (data) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}; 