import { Gamestate, BotSelection } from '../models/gamestate';

enum DrawBehaviour {
    random,
    dynamite,
    waterbomb
}

const ROCK: BotSelection = 'R', PAPER: BotSelection = 'P', SCISSOR: BotSelection = 'S', DYNAMITE: BotSelection = 'D', WATERBOMB: BotSelection = 'W';

class Bot {
    // Store encoded round outcomes that correlate to a win
    private winningMovePairs = new Set<string>(["RS", "SP",
        "PR", "WD", "RW", "PW", "SW", "DR", "DP", "DS"]);
    private undrawnRoundCount = 0;
    private lostRoundCount = 0;
    private potentialRoundScore = 1;
    private previousRoundScore = 1;
    private usedPlayerDynamite: number = 0;
    private usedOpponentDynamite: number = 0;
    private expectedOpponentBehaviour: DrawBehaviour = DrawBehaviour.random; // 0 random, 1 D, 2 W

    makeMove(gamestate: Gamestate): BotSelection {
        if (gamestate.rounds.length === 0)
            return this.selectRandomMove();
        let previousRoundMoves = gamestate.rounds[gamestate.rounds.length-1];
        // Track the current number of non-drawn rounds and lost rounds
        let previousRoundScoreDelta = this.calculateRoundScoreDelta(previousRoundMoves);
        if (previousRoundScoreDelta !== 0) {
            this.undrawnRoundCount++;
            if (previousRoundScoreDelta < 0) {
                this.lostRoundCount++;
            }
        }
        // After a draw has been resolved, predict opponent draw behaviour
        if (this.potentialRoundScore === 1) {
            if (this.previousRoundScore > 1) {
                this.updateExpectedOpponentBehaviour(previousRoundMoves);
            }
        } else {
            // Repeated ties when expecting random play implies deliberate opponent dynamite
            if (this.potentialRoundScore > 3 && this.expectedOpponentBehaviour === DrawBehaviour.random && this.usedOpponentDynamite<100) {
                return WATERBOMB;
            }
            if (this.expectedOpponentBehaviour === DrawBehaviour.waterbomb) {
                return this.selectRandomMove();
            } else if (this.expectedOpponentBehaviour === DrawBehaviour.random) {
                if (this.usedPlayerDynamite < 100) {
                    this.usedPlayerDynamite++;
                    return DYNAMITE;
                }
            } else if (this.usedOpponentDynamite<100){
                return WATERBOMB;
            }
        }
        // Try and use dynamite more often if not using it enough
        if (this.usedPlayerDynamite < 100) {
            let ownLossRate = this.lostRoundCount / this.undrawnRoundCount;
            let higherWinRate = Math.max(1 - ownLossRate, ownLossRate);
            let projectedTotalRounds = 1000 / higherWinRate;
            let projectedRemainingRounds = projectedTotalRounds - this.undrawnRoundCount;
            let dynamiteProbability = (100 - this.usedPlayerDynamite) / projectedRemainingRounds;
            if (Math.random() < dynamiteProbability) {
                this.usedPlayerDynamite++;
                return DYNAMITE;
            }
        }
        return this.selectRandomMove();
    }

    private selectRandomMove() {
        return [ROCK, PAPER, SCISSOR][Math.round(Math.random()*3-0.5)];
    }

    private updateExpectedOpponentBehaviour(previousRoundMoves) {
        if (previousRoundMoves.p2 === DYNAMITE && this.usedOpponentDynamite < 100) {
            this.expectedOpponentBehaviour = DrawBehaviour.dynamite;
        } else if (previousRoundMoves.p2 === WATERBOMB && this.usedPlayerDynamite < 100) {
            this.expectedOpponentBehaviour = DrawBehaviour.waterbomb;
        } else {
            this.expectedOpponentBehaviour = DrawBehaviour.random;
        }
    }

    // Return the scoring delta (1 is positive for the bot)
    private calculateRoundScoreDelta(previousRound) {
        this.previousRoundScore = this.potentialRoundScore;
        if (previousRound.p2 === DYNAMITE)
            this.usedOpponentDynamite++;
        if (previousRound.p1 === previousRound.p2) {
            this.potentialRoundScore++;
            return 0;
        }
        let previousRoundPotentialScore = this.potentialRoundScore;
        this.potentialRoundScore = 1;
        let previousRoundOutcomeString = previousRound.p1 + previousRound.p2;
        if (this.winningMovePairs.has(previousRoundOutcomeString))
            return previousRoundPotentialScore;
        return -previousRoundPotentialScore;
    }
}

export = new Bot();
