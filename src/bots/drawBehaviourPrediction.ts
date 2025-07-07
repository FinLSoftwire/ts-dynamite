import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    // Store encoded round outcomes that correlate to a win
    private roundWinners = new Set<string>(["RS", "SP",
        "PR", "WD", "RW", "PW", "SW", "DR", "DP", "DS"]);
    private currentNonDrawingRounds = 0;
    private currentLosingRounds = 0;
    private pointValue = 1;
    private previousPointValue = 1;
    private dynamiteUses: number = 0;
    private opponentDynamiteUses: number = 0;
    private opponentDrawBehaviour: number = 0; // 0 random, 1 D, 2 W
    private dynamiteRepetitionThreshold = 2;

    makeMove(gamestate: Gamestate): BotSelection {
        // Goal is to use dynamite sparingly - when winning below a certain threshold
        // Or if nearing the end of the game
        if (gamestate.rounds.length === 0)
            return <BotSelection>'RPS'[Math.round(Math.random()*3-0.5)];
        let roundScoreDelta = this.determineWin(gamestate.rounds[gamestate.rounds.length-1]);
        if (roundScoreDelta !== 0) {
            this.currentNonDrawingRounds++;
            if (roundScoreDelta < 0) {
                this.currentLosingRounds++;
            }
        }
        if (this.previousPointValue > 1 && this.pointValue === 1) {
            if (gamestate.rounds[gamestate.rounds.length-1].p2 === "D" && this.opponentDynamiteUses<100) {
                this.opponentDrawBehaviour = 1;
            } else if (gamestate.rounds[gamestate.rounds.length-1].p2 === "W" && this.dynamiteUses<100) {
                this.opponentDrawBehaviour = 2;
            } else {
                this.opponentDrawBehaviour = 0;
            }
        }
        // Use dynamite by default after a draw
        if (this.pointValue > 1) {
            if (this.pointValue > 3 && this.opponentDrawBehaviour === 0 && this.opponentDynamiteUses<100) {
                return 'W';
            }
            if (this.opponentDrawBehaviour === 2) {
                return <BotSelection>'RPS'[Math.round(Math.random()*3-0.5)];
            } else if (this.opponentDrawBehaviour === 0) {
                if (this.dynamiteUses < 100) {
                    this.dynamiteUses++;
                    return 'D';
                }
            } else if (this.opponentDynamiteUses<100){
                return 'W';
            }
        }
        // Get the higher win rate
        if (this.dynamiteUses < 100) {
            let ownLossRate = this.currentLosingRounds / this.currentNonDrawingRounds;
            let higherWinRate = Math.max(1 - ownLossRate, ownLossRate);
            let projectedRounds = 1000 / higherWinRate;
            let remainingRounds = projectedRounds - this.currentNonDrawingRounds;
            let dynamiteProbability = (100 - this.dynamiteUses) / remainingRounds;
            if (Math.random() < dynamiteProbability) {
                this.dynamiteUses++;
                return 'D';
            }
        }
        return <BotSelection>'RPS'[Math.round(Math.random()*3-0.5)];
    }

    // Return the scoring delta (1 is positive for the bot)
    private determineWin(previousRound) {
        this.previousPointValue = this.pointValue;
        if (previousRound.p2 === "D") {
            this.opponentDynamiteUses++;
        }
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
