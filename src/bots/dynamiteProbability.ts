import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    private roundWinners = new Set<string>(["RS", "SP",
        "PR", "WD", "RW", "PW", "SW", "DR", "DP", "DS"]);
    private currentNonDrawingRounds = 1;
    private currentLosingRounds = 0;
    private pointValue = 1;
    private dynamiteUseThreshold: number = 0.1;
    private dynamiteUses: number = 0;
    private dynamiteAttempts: number = 0;
    private currentScoreLikelihood = 1;

    makeMove(gamestate: Gamestate): BotSelection {
        // Goal is to use dynamite sparingly - when winning below a certain threshold
        // Or if nearing the end of the game
        if (gamestate.rounds.length === 0)
            return <BotSelection>'RPS'[Math.round(Math.random()*3-0.5)];
        let roundScoreDelta = this.determineWin(gamestate.rounds[gamestate.rounds.length-1]);
        // Use a binomial approximation of the current score probability to determine when to use dynamite
        if (roundScoreDelta !== 0) {
            this.currentScoreLikelihood *= 0.5 * (this.currentNonDrawingRounds++);
            if (roundScoreDelta < 0) {
                this.currentLosingRounds++;
            }
            this.currentScoreLikelihood /= Math.max(1,this.currentLosingRounds);
        }
        // Use dynamite by default after a draw
        if (this.pointValue > 1 && this.dynamiteUses < 100) {
            this.dynamiteUses++;
            return 'D';
        }
        if (this.currentLosingRounds > this.currentNonDrawingRounds/2 && this.currentScoreLikelihood <= this.dynamiteUseThreshold) {
            if (this.dynamiteUses < 100) {
                this.dynamiteUses++;
                return 'D';
            } else {
                this.dynamiteAttempts++;
            }
        }
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
