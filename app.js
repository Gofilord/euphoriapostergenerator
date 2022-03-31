'use strict';

const fetchQuotes = async () => {
    return fetch('./quotes.json').then(res => res.json()).then(quotes => {
        return quotes;
    })
}

const DEFAULT_TIMEOUT = 200;

const characters = {
    'rue': {
        float: 'right'
    },
    'cal': {
        float: 'left'
    },
    'nate': {
        float: 'left'
    },
    'cassie': {
        float: 'right'
    },
    'maddy': {
        float: 'right'
    },
    'fezco': {
        float: 'right'
    }
};

const colors = [
    '#b35513',
    '#0e9184',
    '#0e3c91',
    '#411b5e',
    '#6e0b39'
];

const getRandomCharacterName = () => {
    return Object.keys(characters)[Math.floor(Math.random() * Object.keys(characters).length)];
};

const getRandomCharacter = () => {
    const name = getRandomCharacterName();
    // const name = 'cassie';
    return {
        name,
        ...characters[name]
    }
}

const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
}

const smallWords = ['of', 'and', 'the', 'to'];


const generate = async () => {
    let generalFontSize = 18;
    const color = getRandomColor();
    const character = getRandomCharacter();
    const allQuotes = await fetchQuotes();
    const quote = allQuotes[character.name][Math.floor(Math.random() * allQuotes[character.name].length)];
    // const quote = allQuotes['cassie'][3];

    let cache;
    const getWordElements = () => {
        if (cache) {
            return cache;
        }
        cache = document.querySelectorAll('.quote-word');
        return cache;
    }

    const getLastWordRect = () => {
        const words = getWordElements();
        if (words.length) {
            return words[words.length - 1].getClientRects()[0];
        }
    };

    const removeGaps = async () => {
        console.log('removing gaps');
        const words = getWordElements();
        let previousWordRect;
        for (let i = 0; i < words.length; i++) {
            const word = words[i]
            const rect = word.getClientRects()[0];
            if (previousWordRect) {
                if ((rect.top - previousWordRect.top) > generalFontSize) { // that means there's a gap
                    word.style.fontSize = (parseFloat(word.style.fontSize) - 10) + 'px';
                }
            }
            previousWordRect = rect;
        };
        const amountOfRows = countRows() + 1;

        // check if there are still gaps
        if (getLastWordRect().bottom > (amountOfRows * generalFontSize) + 45) {
            await removeGaps();
        }

        return;
    };

    const countRows = () => {
        const words = getWordElements();
        let counter = 0;
        let prevRect;
        for (let i = 0; i < words.length; i++) {
            const word = words[i]
            const rect = word.getClientRects()[0];
            if (prevRect) {
                if (rect.top !== prevRect.top) {
                    counter++;
                }
            }
            prevRect = rect;
        };

        return counter;
    }

    // adds @addition (px) to each and every word on the canvas
    const updateFontSizeForAll = (addition) => new Promise ((resolve) => {
        setTimeout(() => {
            const words = getWordElements();
            console.log('updating font size for', words.length);
            for (let i = 0; i < words.length; i++) {
                words[i].style.fontSize = (parseFloat(words[i].style.fontSize) + addition) + 'px';
            }
            generalFontSize += addition;
            resolve();
        }, DEFAULT_TIMEOUT)
    });

    const $posterWrapper = document.getElementById('poster-wrapper');
    $posterWrapper.style.backgroundColor = color;

    // add svg
    const $svgElement = document.createElement('img');
    $svgElement.src = './svgs/' + character.name + '.svg';
    $svgElement.classList.add(character.name);

    $posterWrapper.append($svgElement);

    const svgHeight = $svgElement.getBoundingClientRect().height;
    const canvasHeight = $posterWrapper.getClientRects()[0].height;
    $svgElement.style.float = character.float;
    $svgElement.style.marginLeft = character.float === 'right' ? 'auto' : -30 + 'px';
    $svgElement.style.marginRight = character.float === 'right' ? -30 + 'px' : 'auto';
    $svgElement.style.marginTop = (canvasHeight - svgHeight - 45) + 'px';

    // add quote words
    quote.split(' ').forEach((word, index) => {
        const fontSize = (smallWords.includes(word) ? generalFontSize * 0.7 : generalFontSize) + 'px';
        const $word = document.createElement('span');
        $word.innerHTML = word + " ";
        $word.classList.add('quote-word');
        $word.style.fontSize = fontSize;

        $posterWrapper.append($word);
    });

    // add overlay
    const $overlay = document.createElement('div');
    $overlay.classList.add('overlay');
    $overlay.style.background = `linear-gradient(15deg, ${color}, transparent), url(https://grainy-gradients.vercel.app/noise.svg)`;
    $posterWrapper.append($overlay);

    // MAGIC IS HERE
    const enlargeTextToFillCanvas = () => new Promise((resolve) => {
        if (canvasHeight - getLastWordRect().y > 30) {
            updateFontSizeForAll(4).then(() => {
                enlargeTextToFillCanvas().then(resolve)
            })
        } else {
            resolve();
        }
        
    });

    const fitTextInCanvas = () => new Promise((resolve) => {
        if (getLastWordRect().bottom > canvasHeight) {
            updateFontSizeForAll(-4).then(() => {
                fitTextInCanvas().then(resolve);
            });
        } else {
            resolve();
        }
    });

    await enlargeTextToFillCanvas();
    await removeGaps();
    await fitTextInCanvas();
    console.log('done adjusting');
}   

document.addEventListener('DOMContentLoaded', () => {
    generate();
})