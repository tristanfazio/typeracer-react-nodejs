import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PlayerContainer from '../../components/PlayerContainer';
import QuoteContainer from '../../components/QuoteContainer';
import { initGame, setStatusFinished, setStatusPostgame, updateGameState } from '../../state/gameState/actionCreators';
import { FillState, GameState, GameStatus } from '../../state/gameState/gameStateReducer';
import { AppDispatch, RootState } from '../../state/store';
import styles from './Game.module.css';
import PostGame from '../../components/PostGame';

const Game = () => {
    const gameState: GameState = useSelector((state: RootState) => state.gameState);
    const gameStatus = useSelector((state: RootState) => state.gameState.status);
    const gameTime = useSelector((state: RootState) => state.gameState.gameTime);
    const dispatch: AppDispatch = useDispatch();

    // Handle Status Transitions
    useEffect(() => {
        // fake loading
        if (gameStatus === GameStatus.LOADING) {
            setTimeout(() => {
                dispatch(initGame());
            }, 1000);
        }

        if (gameStatus === GameStatus.FINISHED) {
            setTimeout(() => {
                dispatch(setStatusPostgame());
            }, 2000);
        }
    }, [dispatch, gameStatus]);

    useEffect(() => {
        window.addEventListener('keydown', onKeyPress);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener('keydown', onKeyPress);
        };
    }, [gameStatus, gameTime]);

    const onKeyPress = (e: KeyboardEvent): void => {
        if (e.repeat) return;
        if (e.location !== KeyboardEvent.DOM_KEY_LOCATION_STANDARD) return;
        if (gameStatus !== GameStatus.PLAYING) return;

        const quoteArray = gameState.quoteArray;
        const currentWordIndex = gameState.currentWordIndex;
        const currentLetterIndex = gameState.currentLetterIndex;
        const currentLetter = quoteArray[currentWordIndex][currentLetterIndex];

        // check if backspace
        if (e.key === 'Backspace') {
            if (currentWordIndex === 0 && currentLetterIndex === 0) return;
            // mark current letter as default
            gameState.quoteArray[currentWordIndex][currentLetterIndex].fillState = FillState.DEFAULT;

            let previousLetterIndex = currentLetterIndex;
            let previousWordIndex = currentWordIndex;

            // decrement indexes
            if (currentLetterIndex > 0) {
                // mid word, only decrement letter
                previousLetterIndex = gameState.currentLetterIndex - 1;
            } else {
                // travers back a word
                previousWordIndex = gameState.currentWordIndex - 1;
                previousLetterIndex = quoteArray[previousWordIndex].length - 1;
                gameState.completedWordCount--;
            }

            // update state object
            gameState.currentLetterIndex = previousLetterIndex;
            gameState.currentWordIndex = previousWordIndex;
            gameState.quoteArray[previousWordIndex][previousLetterIndex].fillState = FillState.CURSOR;
            gameState.completedLetterCount--;

            // send state and return out before other checks
            dispatch(updateGameState({ ...gameState, gameTime }));
            return;
        }

        // check if correct
        if (currentLetter.character === e.key.toString()) {
            // correct
            // mark letter correct
            gameState.quoteArray[currentWordIndex][currentLetterIndex].fillState = FillState.CORRECT;
        } else {
            // incorrect keypress
            // mark letter incorrect
            gameState.quoteArray[currentWordIndex][currentLetterIndex].fillState = FillState.ERROR;
            gameState.errors++;
        }

        // check for remaining letters in word
        if (currentLetterIndex < quoteArray[currentWordIndex].length - 1) {
            // remaining letters, increment letter index
            gameState.currentLetterIndex++;
        } else {
            // else, no remaining letters in word
            // reset letter index to 0
            gameState.currentLetterIndex = 0;
            // progress word index
            gameState.currentWordIndex++;
            // update player progress
            gameState.completedWordCount++;
            gameState.myProgress = Math.trunc((gameState.completedWordCount / gameState.quoteArray.length) * 100);
        }
        gameState.completedLetterCount++;

        dispatch(updateGameState({ ...gameState, gameTime }));
        if (gameState.completedWordCount === quoteArray.length) {
            dispatch(setStatusFinished());
        }
    };

    function renderGameComponents(): React.ReactElement<React.JSXElementConstructor<any>> {
        return (
            <>
                <div className={styles.gameContainer}>
                    <PlayerContainer key='player-container' gameState={gameState} />
                    <QuoteContainer key='quote-container' gameState={gameState} />
                </div>
            </>
        );
    }

    const isLoading = gameStatus === GameStatus.LOADING;
    const isGameViewable = [GameStatus.COUNTDOWN, GameStatus.PLAYING, GameStatus.FINISHED].includes(gameStatus);
    const isPostGame = gameStatus === GameStatus.POSTGAME;

    return (
        <div className={styles.gamePage}>
            {isLoading && <p className={styles.loadingText}>Loading...</p>}
            {isGameViewable && renderGameComponents()}
            {isPostGame && <PostGame />}
        </div>
    );
};

export default Game;
