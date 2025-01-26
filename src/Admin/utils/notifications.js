import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const sendToAdminPanel = async (userData, actionType) => {
  try {
    const notification = {
      userId: userData.uid,
      userEmail: userData.email,
      fullName: userData.fullName,
      actionType,
      timestamp: serverTimestamp(),
      isRead: false,
      details: {
        ...userData,
        password: undefined
      }
    };

    await addDoc(collection(db, 'adminNotifications'), notification);
  } catch (error) {
    console.error('Error sending notification to admin:', error);
    throw error;
  }
};

export const getAdminOptions = async () => {
  try {
    const optionsSnapshot = await getDocs(collection(db, 'adminOptions'));
    return optionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching admin options:', error);
    throw error;
  }
}; 