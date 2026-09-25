import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, AccountStatus } from '../types/auth';

const PROFILE_CACHE_PREFIX = 'spellready_profile_cache_';

export class UserService {
  /**
   * Fetch a user profile from Firestore by UID with local caching
   */
  public async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!uid) return null;

    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        this.cacheProfile(profile);
        return profile;
      }
    } catch (err: any) {
      console.warn('Error fetching Firestore user profile, reading cached profile:', err?.message || err);
    }

    // Fallback to cache if network error or offline
    return this.getCachedProfile(uid);
  }

  /**
   * Create a new user profile document in Firestore
   */
  public async createUserProfile(profile: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      this.cacheProfile(profile);
    } catch (err: any) {
      console.warn('Error creating Firestore user profile, persisting to local cache:', err?.message || err);
      this.cacheProfile(profile);
    }
  }

  /**
   * Update permitted profile fields
   */
  public async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      const safeUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, safeUpdates);
      
      const cached = this.getCachedProfile(uid);
      if (cached) {
        this.cacheProfile({ ...cached, ...safeUpdates });
      }
    } catch (err: any) {
      console.warn('Error updating Firestore user profile, updating local cache:', err?.message || err);
      const cached = this.getCachedProfile(uid);
      if (cached) {
        this.cacheProfile({ ...cached, ...updates, updatedAt: new Date().toISOString() });
      }
    }
  }

  private cacheProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${PROFILE_CACHE_PREFIX}${profile.uid}`, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  private getCachedProfile(uid: string): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(`${PROFILE_CACHE_PREFIX}${uid}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
}

export const userService = new UserService();
