import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    private moveSelection:BotSelection[] = ['R','P','S'];
    makeMove(gamestate: Gamestate): BotSelection {
        if (gamestate.rounds.length === 0)
            return this.moveSelection[Math.round(Math.random()*3-0.5)];
        return gamestate.rounds[gamestate.rounds.length-1].p2;
    }
}

export = new Bot();
