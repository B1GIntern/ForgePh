import axiosInstance from '../config/axiosConfig';

export interface GameConfig {
  _id: string;
  name: string;
  gameType: string;
  points: number;
  featured: boolean;
  prizedAssigned?: Array<{
    prizeId: string;
    prizeName: string;
    multiplier?: number;
  }>;
}

export interface GamePlay {
  playsRemaining: number;
  playsUsed: number;
  success: boolean;
}

export interface SpinResult {
  success: boolean;
  pointsWon: number;
  totalPoints: number;
  specialPrizeWon?: boolean;
  specialPrizeName?: string;
  message?: string;
}

/**
 * Fetch all available games 
 */
export const getAllGames = async () => {
  try {
    const response = await axiosInstance.get('/games');
    return response.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

/**
 * Get a specific game by type (e.g., "SlotMachine")
 */
export const getGameByType = async (gameType: string, featured: boolean = true) => {
  try {
    const response = await axiosInstance.get('/games');
    const games = response.data;
    return games.find(
      (game: GameConfig) => game.gameType === gameType && game.featured === featured
    );
  } catch (error) {
    console.error(`Error fetching ${gameType} game:`, error);
    throw error;
  }
};

/**
 * Get remaining plays for a specific game and user
 */
export const getRemainingPlays = async (gameType: string, userId: string): Promise<GamePlay> => {
  try {
    const response = await axiosInstance.get(`/users/game-plays/${gameType}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching remaining plays:', error);
    throw error;
  }
};

/**
 * Record a spin/play result for slot machine
 */
export const recordSlotMachineSpin = async (
  userId: string, 
  finalSymbols: any[], 
  pointsToDeduct: number
): Promise<SpinResult> => {
  try {
    const response = await axiosInstance.post('/games/slot-machine/spin', {
      userId,
      finalSymbols,
      pointsToDeduct
    });
    return response.data;
  } catch (error) {
    console.error('Error recording spin result:', error);
    throw error;
  }
};