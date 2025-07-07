import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    private roundWinners = new Set<string>(["RS", "SP",
        "PR", "WD", "RW", "PW", "SW", "DR", "DP", "DS"]);
    private currentScoreDelta: number = 0;
    private pointValue = 1;
    private dynamiteUseThreshold: number = -0.06;
    private dynamiteUses: number = 0;

    makeMove(gamestate: Gamestate): BotSelection {
        // Goal is to use dynamite sparingly - when winning below a certain threshold
        // Or if nearing the end of the game
        if (gamestate.rounds.length === 0)
            return <BotSelection>'RPS'[Math.round(Math.random()*3-0.5)];
        this.currentScoreDelta += this.determineWin(gamestate.rounds[gamestate.rounds.length-1]);
        const currentScoreLikelihood = this.currentScoreDelta/gamestate.rounds.length;
        if (currentScoreLikelihood <= this.dynamiteUseThreshold && this.dynamiteUses++ < 100)
            return 'D';
        return <BotSelection>'RPS'[Math.round(Math.random()*3-0.5)];
    }

    // Return the scoring delta (1 is positive for the bot)
    private determineWin(previousRound) {
        if (previousRound.p1 === previousRound.p2) {
            this.pointValue++;
            return 0;
        }
        let previousValue = this.pointValue;
        this.pointValue = 1;
        let previousRoundString = previousRound.p1 + previousRound.p2;
        if (this.roundWinners.has(previousRoundString))
            return previousValue;
        return -previousValue;
    }
}

export = new Bot();
