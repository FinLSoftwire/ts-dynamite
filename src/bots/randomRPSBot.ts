import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    makeMove(gamestate: Gamestate): BotSelection {
        return <BotSelection>'RPS'[Math.round(Math.random()*3-0.5)];
    }
}

export = new Bot();
