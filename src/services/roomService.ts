import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp,
  getDocs,
  addDoc
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { Player, Room, Narration, GameTheme } from '../types';

const ROOMS_COLLECTION = 'rooms';

export const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createRoom = async (hostUsername: string, theme: GameTheme, userId: string): Promise<string> => {
  const code = generateRoomCode();
  const roomId = code; // Using code as ID for simplicity
  
  const roomData = {
    code,
    theme,
    status: 'lobby',
    createdAt: serverTimestamp(),
    hostId: userId,
    currentRound: 1,
    timer: 30
  };

  const playerData: Player = {
    id: userId,
    username: hostUsername,
    hp: 100,
    hunger: 100,
    sanity: 100,
    trust: 100,
    isAlive: true,
    isReady: false,
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${hostUsername}`
  };

  try {
    await setDoc(doc(db, ROOMS_COLLECTION, roomId), roomData);
    await setDoc(doc(db, `${ROOMS_COLLECTION}/${roomId}/players`, userId), playerData);
    return roomId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, ROOMS_COLLECTION);
  }
};

export const joinRoom = async (code: string, username: string, userId: string): Promise<string> => {
  const roomId = code.toUpperCase();
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  
  try {
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
      throw new Error("Node tidak ditemukan. Periksa kembali kode sinyal.");
    }

    const roomData = roomSnap.data();
    if (roomData.status !== 'lobby') {
      throw new Error("Sinkronisasi ditutup. Operasi sudah berjalan.");
    }

    const playerData: Player = {
      id: userId,
      username,
      hp: 100,
      hunger: 100,
      sanity: 100,
      trust: 100,
      isAlive: true,
      isReady: false,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`
    };

    await setDoc(doc(db, `${ROOMS_COLLECTION}/${roomId}/players`, userId), playerData);
    return roomId;
  } catch (error) {
    if (error instanceof Error && error.message.includes("tidak ditemukan")) {
      throw error;
    }
    return handleFirestoreError(error, OperationType.WRITE, `${ROOMS_COLLECTION}/${roomId}/players`);
  }
};

export const getRoom = (roomId: string, callback: (room: any) => void) => {
  return onSnapshot(doc(db, ROOMS_COLLECTION, roomId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `${ROOMS_COLLECTION}/${roomId}`);
  });
};

export const getPlayers = (roomId: string, callback: (players: Player[]) => void) => {
  const playersRef = collection(db, `${ROOMS_COLLECTION}/${roomId}/players`);
  return onSnapshot(playersRef, (snapshot) => {
    const players = snapshot.docs.map(doc => doc.data() as Player);
    callback(players);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `${ROOMS_COLLECTION}/${roomId}/players`);
  });
};

export const updatePlayerReady = async (roomId: string, userId: string, isReady: boolean) => {
  const playerRef = doc(db, `${ROOMS_COLLECTION}/${roomId}/players`, userId);
  try {
    await updateDoc(playerRef, { isReady });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, playerRef.path);
  }
};

export const startRoom = async (roomId: string, userId: string) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  try {
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found");
    if (roomSnap.data().hostId !== userId) throw new Error("Hanya Room Master yang dapat memulai operasi.");

    await updateDoc(roomRef, { status: 'playing' });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomRef.path);
  }
};

export const addNarration = async (roomId: string, narration: Omit<Narration, 'id'>) => {
  const narrationsRef = collection(db, `${ROOMS_COLLECTION}/${roomId}/narrations`);
  try {
    await addDoc(narrationsRef, {
      ...narration,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, narrationsRef.path);
  }
};

export const getNarrations = (roomId: string, callback: (narrations: Narration[]) => void) => {
  const narrationsRef = collection(db, `${ROOMS_COLLECTION}/${roomId}/narrations`);
  return onSnapshot(narrationsRef, (snapshot) => {
    const narrations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Narration;
    });
    // Sort by timestamp
    narrations.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    callback(narrations);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, narrationsRef.path);
  });
};

export const updateRoomGameState = async (roomId: string, data: any) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  try {
    await updateDoc(roomRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomRef.path);
  }
};

export const initializeGame = async (roomId: string, initialContent: any) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  try {
    await updateDoc(roomRef, {
      currentChoices: initialContent.choices,
      currentRound: 1,
      timer: 30,
      isProcessing: false
    });
    
    // Add initial narrations
    for (const n of initialContent.narrations) {
      await addNarration(roomId, n);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomRef.path);
  }
};
