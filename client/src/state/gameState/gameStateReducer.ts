const testString = `You followed your conscience in the hope that others would follow theirs. 
You didn’t do it for a reward, or a pat on the head. The universe never tells us if we did right or wrong. 
It’s more important to try and help people, and to know that you did. 
More important that someone else’s life gets better, than for you to feel good about yourself. 
You never know the effect you might have on someone, not really. 
Maybe one cruel thing you said haunts them forever. 
Maybe one moment of kindness gives them comfort or courage. Maybe you said the one thing they needed to hear. 
It doesn’t matter if you ever know. You just have to try.`;


export enum FillState {
    DEFAULT = 'DEFAULT',
    CORRECT = 'CORRECT',
    CURSOR = 'CURSOR',
    ERROR = 'ERROR',
}

export class CharElement {
    character: string = '';
    fillState: FillState = FillState.DEFAULT;
    index: number = 0;
    constructor(character: string, index: number) {
        this.character = character;
        this.index = index;
    }
}

export interface GameState {
    gameId: string;
    isLoading: boolean;
    quoteArray: CharElement[][];
    currentWordIndex: number;
    currentLetterIndex: number;
}

export const initialState: GameState = {
    gameId: 'test-game-id-123',
    isLoading: false,
    quoteArray: parseInitialQuoteToWords(testString),
    currentWordIndex: 4,
    currentLetterIndex: 3,
};

const gameStateReducer = (state = initialState, action: any): GameState => {
    switch (action.type) {
    }
    return initialState;
};

export default gameStateReducer;

function parseInitialQuoteToWords(testString: string): CharElement[][] {
    const parsedQuoteArray = testString.split(/(\s+)/).map(word => {
        return word.split('').map((charElement,index) => {
            return new CharElement(charElement, index)
        })
    });
    return parsedQuoteArray;
}
