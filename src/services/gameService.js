import { v4 as uuidv4 } from "uuid";
import { checkCharacterInRange } from "../utils/utils.js";
import { getRandomPowerUp } from "../models/powerups.js";
import { AppError } from "../utils/errors.js";
import {
  CHARACTERS,
  EFFECT_TYPES,
  GAME_OVER_REASONS,
  WS_MESSAGE_TYPES,
} from "../constants.js";
import { puzzles } from "../models/puzzles.js";

export class GameService {
  constructor(stateManager, effectService, webSocketService) {
    this.stateManager = stateManager;
    this.effectService = effectService;
    this.webSocketService = webSocketService;
  }

  createGame(player1, player2, defaultFoundArr, defaultPowerUpsArr) {
    if (!player1 || !player2) {
      throw new Error("Missing player IDs");
    }
    const gameId = `game-${uuidv4()}`;
    const gameData = {
      gameId,
      players: [player1, player2],
      foundArr: defaultFoundArr(),
      powerUpsArr: defaultPowerUpsArr(),
      startTime: Date.now(),
      playerStats: {
        [player1]: { wallysFound: 0, activeEffects: [] },
        [player2]: { wallysFound: 0, activeEffects: [] },
      },
    };
    this.stateManager.addGame(gameId, gameData);
    this.webSocketService.sendPairedMessage(gameId, gameData);
    return { gameId, gameData };
  }

  processGuess(puzzleIdx, x, y, playerId) {
    const characters = puzzles[puzzleIdx]?.characters;
    if (!characters) {
      throw new AppError("Invalid puzzle index", 400);
    }

    const result = this.stateManager.getGameByPlayerId(playerId);

    if (!result || !result.gameData) {
      throw new AppError(`No game found for playerId ${playerId}`, 400);
    }

    let charFound = false;
    const { gameId, gameData } = result;
    const { foundArr, powerUpsArr, playerStats } = gameData;

    for (const character in characters) {
      if (!checkCharacterInRange(character, { x, y }, characters)) continue;


      if (character === CHARACTERS.WALLY && !foundArr[puzzleIdx]) {
        charFound = character;
        foundArr[puzzleIdx] = true;
        playerStats[playerId].wallysFound += 1;

        const updateMessage = { type: WS_MESSAGE_TYPES.UPDATE_FOUND, foundArr, playerStats, puzzleIdx, playerWhoFoundId: playerId };

        if (!foundArr.includes(false)) {
          this.webSocketService.sendGameOver( gameId, GAME_OVER_REASONS.ALL_FOUND);
          this.webSocketService.sendToGamePlayers(gameId, updateMessage);
          this.cleanupGame(gameId);
        } else {
          this.effectService.cancelNegativeEffects(playerId, gameData);
          this.webSocketService.sendToGamePlayers(gameId, updateMessage);
        }
      }

      if (character !== CHARACTERS.WALLY && !powerUpsArr[puzzleIdx][character]) {
        charFound = character;
        powerUpsArr[puzzleIdx][character] = true;
        const powerUp = getRandomPowerUp(character);
        const opponentId = gameData.players.find((id) => id !== playerId);
        const effectTargetId =
          powerUp.type === EFFECT_TYPES.POSITIVE ? playerId : opponentId;

        this.effectService.applyEffect(powerUp, effectTargetId, gameData);

        this.webSocketService.sendToGamePlayers(gameId, { type: WS_MESSAGE_TYPES.POWER_UP_FOUND, puzzleIdx, character, playerWhoFoundId: playerId });
      }
      break;
    }

    return charFound;
  }

  cleanupGame(gameId) {
    const game = this.stateManager.getGame(gameId);
    if (game) {
      this.stateManager.clearEffectTimeoutsForPlayer(game);
      this.stateManager.removeGame(gameId);
    }
  }
}
