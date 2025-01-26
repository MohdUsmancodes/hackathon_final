import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

class DepartmentManagerAuth {
  constructor() {
    this.managersRef = collection(db, 'departmentManagers');
    this.departmentsRef = collection(db, 'departments');
  }

  // Register new department manager
  registerManager = async (email, password, fullName, departmentId) => {
    try {
      // Check if department exists
      const deptDoc = await getDoc(doc(this.departmentsRef, departmentId));
      if (!deptDoc.exists()) {
        throw new Error('Department does not exist');
      }

      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create manager profile
      await setDoc(doc(this.managersRef, user.uid), {
        email,
        fullName,
        departmentId,
        role: 'department_manager',
        isVerified: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      return {
        uid: user.uid,
        email: user.email,
        departmentId
      };
    } catch (error) {
      console.error('Manager registration failed:', error);
      throw error;
    }
  };

  // Login department manager
  loginManager = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get manager profile
      const managerDoc = await getDoc(doc(this.managersRef, user.uid));
      if (!managerDoc.exists()) {
        throw new Error('Manager profile not found');
      }

      const managerData = managerDoc.data();
      if (!managerData.isVerified) {
        throw new Error('Account pending verification');
      }

      // Update last login
      await updateDoc(doc(this.managersRef, user.uid), {
        lastLogin: new Date().toISOString()
      });

      return {
        uid: user.uid,
        email: user.email,
        departmentId: managerData.departmentId,
        fullName: managerData.fullName,
        role: managerData.role
      };
    } catch (error) {
      console.error('Manager login failed:', error);
      throw error;
    }
  };

  // Get available departments
  getAvailableDepartments = async () => {
    try {
      const departments = await getDocs(this.departmentsRef);
      return departments.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get departments:', error);
      throw error;
    }
  };

  // Get manager profile
  getManagerProfile = async (managerId) => {
    try {
      const managerDoc = await getDoc(doc(this.managersRef, managerId));
      if (!managerDoc.exists()) {
        throw new Error('Manager not found');
      }
      return {
        id: managerDoc.id,
        ...managerDoc.data()
      };
    } catch (error) {
      console.error('Failed to get manager profile:', error);
      throw error;
    }
  };

  // Logout manager
  logoutManager = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  // Send password reset email
  sendPasswordReset = async (email) => {
    try {
      // Check if email belongs to a department manager
      const q = query(this.managersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('No department manager account found with this email');
      }

      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  // Verify password reset code
  verifyPasswordReset = async (code) => {
    try {
      await auth.verifyPasswordResetCode(code);
      return true;
    } catch (error) {
      console.error('Password reset verification failed:', error);
      throw error;
    }
  };
}

export const departmentManagerAuth = new DepartmentManagerAuth(); 