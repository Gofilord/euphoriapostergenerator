'use strict';

const fetchQuotes = async () => {
    return fetch('./quotes.json').then(res => res.json()).then(quotes => {
        return quotes;
    })
}

const DEFAULT_TIMEOUT = 200;

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const complementingCharacterOffsets = {
    'rue': {
        left: 0,
        top: '30%'
    },
    'jules': {
        left: '-25%',
        top: '20%'
    },
    'cal': {
        left: '30%',
        top: '-9%'
    },
    'nate': {
        left: 0,
        top: '10%'
    },
    'cassie': {
        left: '10%',
        top: '10%'
    },
    'maddy': {
        left: '-40%',
        top: 0
    }
}

const characters = {
    'rue': {
        float: 'right',
        complementingCharacter: {
            name: 'jules',
            faceOffset: complementingCharacterOffsets['jules']
        }
    },
    'cal': {
        float: 'left',
        complementingCharacter: {
            name: 'nate',
            faceOffset: complementingCharacterOffsets['nate']
        }
    },
    'nate': {
        float: 'left',
        complementingCharacter: {
            name: 'cal',
            faceOffset: complementingCharacterOffsets['cal']
        }
    },
    'cassie': {
        float: 'right',
        complementingCharacter: {
            name: 'maddy',
            faceOffset: complementingCharacterOffsets['maddy']
        }
    },
    'maddy': {
        float: 'right',
        complementingCharacter: {
            name: 'cassie',
            faceOffset: complementingCharacterOffsets['cassie']
        }
    },
    'fezco': {
        float: 'right',
        complementingCharacter: {
            name: 'rue',
            faceOffset: complementingCharacterOffsets['rue']
        }
    },
    'jules': {
        float: 'right',
        complementingCharacter: {
            name: 'rue',
            faceOffset: complementingCharacterOffsets['rue']
        }
    }
};

const colors = [
    '#b35513',
    '#085a52',
    '#143956',
    '#411b5e',
    '#6e0b39',
    '#886f2c'
];

const getRandomCharacterName = () => {
    return Object.keys(characters)[Math.floor(Math.random() * Object.keys(characters).length)];
};

const getRandomCharacter = () => {
    let name = getRandomCharacterName();
    // we don't want to repeat the same character twice in a row.
    while (localStorage.getItem('lastCharacter') === name) {
        name = getRandomCharacterName();
    }
    localStorage.setItem('lastCharacter', name);

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
    const color = getRandomColor();
    const character = getRandomCharacter();
    const allQuotes = await fetchQuotes();
    const quote = allQuotes[character.name][Math.floor(Math.random() * allQuotes[character.name].length)];
    
    let cache;
    const getWordElements = () => {
        if (cache) {
            return cache;
        }
        cache = document.querySelectorAll('.quote-word');
        return cache;
    }
    
    const $posterWrapper = document.getElementById('poster-wrapper');
    $posterWrapper.style.backgroundColor = color;  

    const generalFontSize = ($posterWrapper.getBoundingClientRect().width / quote.length) + document.body.getBoundingClientRect().height / 45;
    
    // add complementing character
    const $complementingSvg = document.createElement('img');
    $complementingSvg.src = './svgs/' + character.complementingCharacter.name + '.svg';
    $complementingSvg.classList.add('complementing-character');
    $complementingSvg.style.left = character.complementingCharacter.faceOffset.left;
    $complementingSvg.style.top = character.complementingCharacter.faceOffset.top;
    
    $posterWrapper.append($complementingSvg);

    // add svg
    const $svgElement = document.createElement('img');
    $svgElement.src = './svgs/' + character.name + '.svg';
    $svgElement.classList.add(character.name);
    $svgElement.classList.add('character');
    $svgElement.classList.add('svg');
    $posterWrapper.append($svgElement);

    const svgHeight = $svgElement.getBoundingClientRect().height;
    const canvasHeight = $posterWrapper.getClientRects()[0].height;
    $svgElement.style.float = character.float;
    $svgElement.style.marginLeft = character.float === 'right' ? 'auto' : -30 + 'px';
    $svgElement.style.marginRight = character.float === 'right' ? -30 + 'px' : 'auto';
    $svgElement.style.marginTop = (canvasHeight - svgHeight - 45) + 'px';

    const $quoteWrapper = document.getElementById('quote-wrapper');

    const INITIAL_DELAY = 2;
    const quoteWords = quote.split(' ');

    // add quote words
    quoteWords.forEach((word, index) => {
        const fontSize = (smallWords.includes(word) ? generalFontSize * 0.7 : generalFontSize) + 'px';
        const $word = document.createElement('span');
        $word.innerHTML = word + " ";
        $word.classList.add('quote-word');
        $word.style.fontSize = fontSize;

        // each word different animation delay
        $word.style.animationDelay = 1 + (index * (4 / quoteWords.length)) + 's';

        $quoteWrapper.append($word);
    });

    // add character name
    const $characterName = document.createElement('span');
    $characterName.classList.add('character-name');
    $characterName.innerHTML = character.name;
    $quoteWrapper.append($characterName);

    setTimeout(() => {
        inlineSVG.init();
    }, 200)

    // add overlay
    const $overlay = document.createElement('div');
    $overlay.classList.add('overlay');
    $overlay.style.background = `linear-gradient(15deg, ${color}, transparent), url(https://grainy-gradients.vercel.app/noise.svg)`;
    $posterWrapper.append($overlay);

    // add head movement
    setTimeout(() => {
        const $head = document.getElementById('head');
        const docWidth = document.body.getBoundingClientRect().width;
        document.addEventListener('mousemove', (ev) => {
            let deg = (ev.clientX / docWidth) * 3;
            $head.style.transform = 'rotate(' + deg + 'deg)'
        });

        // animate svg creation
        const $paths = document.getElementsByTagName('path')
        for (const path of $paths) {
            const totalLength = path.getTotalLength();
            path.style.strokeDashoffset = totalLength;
            path.style.strokeDasharray = totalLength;
            path.style.animation = 'path 4s linear both';
            path.style.animationDelay = '1s';
        };
    }, 300)

}   

document.addEventListener('DOMContentLoaded', () => {
    generate();
})