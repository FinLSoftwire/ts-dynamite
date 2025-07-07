export type Gamestate = {
    rounds: Round[]
}

type Round = {
    p1: BotSelection,
    p2: BotSelection,
}

export type BotSelection = 'R' | 'P' | 'S' | 'D' | 'W';
