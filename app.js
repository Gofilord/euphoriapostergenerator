'use strict';

const fetchQuotes = async () => {
    return fetch('./quotes.json').then(res => res.json()).then(quotes => {
        return quotes;
    })
}

const DEFAULT_TIMEOUT = 200;

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const characters = {
    'rue': {
        float: 'right',
        complementingCharacter: 'jules',
        faceOffset: {
            left: 0,
            top: '30%'
        },
    },
    'cal': {
        float: 'left',
        complementingCharacter: 'nate',
        faceOffset: {
            left: '30%',
            top: '-9%'
        },
    },
    'nate': {
        float: 'left',
        complementingCharacter: 'cal',
        faceOffset: {
            left: 0,
            top: '10%'
        },
    },
    'cassie': {
        float: 'right',
        complementingCharacter: 'maddy',
        faceOffset: {
            left: '10%',
            top: '10%'
        },
    },
    'maddy': {
        float: 'right',
        complementingCharacter: 'cassie',
        faceOffset: {
            left: '-40%',
            top: 0
        }
    },
    'fezco': {
        float: 'right',
        complementingCharacter: 'lexi',
        faceOffset: {
            left: '80%',
            top: 0
        }
    },
    'jules': {
        float: 'right',
        complementingCharacter: 'rue',
        faceOffset: {
            left: '-25%',
            top: '20%'
        },
    },
    'ali': {
        float: 'left',
        complementingCharacter: 'rue',
        faceOffset: {
            left: 0,
            top: 0
        }
    },
    'lexi': {
        float: 'left',
        complementingCharacter: 'fezco',
        faceOffset: {
            left: '-30%',
            top: '5%'
        }
    },
    'kat': {
        float: 'right',
        complementingCharacter: 'maddy',
        faceOffset: {
            left: 0,
            top: 0
        }
    }
};

const colors = [
    '#b35513',
    '#085a52',
    '#143956',
    '#411b5e',
    '#6e0b39',
    '#886f2c',
    '#9E6242',
    '#7B5164'
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

    const complementingCharacterName = characters[name].complementingCharacter;

    return {
        name,
        ...characters[name],
        complementingCharacter: {
            name: complementingCharacterName,
            faceOffset: characters[complementingCharacterName].faceOffset
        }
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
    const template = document.createElement('template');
    const svgContent = await fetch('./svgs/' + character.name + '.svg').then(res => res.text());
    template.innerHTML = svgContent;
    const $svgElement = template.content.firstChild;
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

    // add overlay
    const $overlay = document.createElement('div');
    $overlay.classList.add('overlay');
    $overlay.style.background = `linear-gradient(15deg, ${color}, transparent), url(./noise.svg)`;
    $posterWrapper.append($overlay);

    // add head movement
    setTimeout(() => {
        // animate svg creation
        const $paths = document.getElementsByTagName('path')
        for (const path of $paths) {
            const totalLength = path.getTotalLength();
            path.style.strokeDashoffset = totalLength;
            path.style.strokeDasharray = totalLength;
            path.style.animation = 'path 4s linear both';
            path.style.animationDelay = '1s';
        };
    }, 100)

}   

document.addEventListener('DOMContentLoaded', () => {
    generate();
})