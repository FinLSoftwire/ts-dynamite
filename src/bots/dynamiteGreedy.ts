import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    private dynamiteUses: number = 0;
    makeMove(gamestate: Gamestate): BotSelection {
        // Use dynamite when it is available, then play randomly
        if (this.dynamiteUses++ < 100)
            return 'D';
        return <BotSelection>'RPS'[Math.round(Math.random()*3-0.5)];
    }
}

export = new Bot();
