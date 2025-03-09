import {startGame, checkCharacter} from "./game.js"
import { setupPhoto,  switchInPlayPhoto } from "./ui.js";

startGame();
setupPhoto(checkCharacter)
switchInPlayPhoto()
