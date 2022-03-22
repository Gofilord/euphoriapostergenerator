import './App.css';
import Quotes from './quotes.json';
import { ReactComponent as Rue } from './svgs/rue.svg';
import { ReactComponent as Cal } from './svgs/cal.svg';
import { ReactComponent as Nate } from './svgs/nate.svg';
import { ReactComponent as Cassie } from './svgs/cassie.svg';
import { ReactComponent as Maddy } from './svgs/maddy.svg';
import { useEffect, useState } from 'react';

const characters = {
  'rue': {
    svg: Rue,
    float: 'right'    
  },
  'cal': {
    svg: Cal,
    float: 'left'    
  },
  'nate': {
    svg: Nate,
    float: 'left'    
  },
  'cassie': {
    svg: Cassie,
    float: 'right'    
  },
  'maddy': {
    svg: Maddy,
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

const getRandomCharacter = () => {
  return Object.keys(characters)[Math.floor(Math.random() * Object.keys(characters).length)];
};

const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
}

const getRandomQuote = (character) => {
  const quotes = Quotes[character];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

const smallWords = ['of', 'and', 'the', 'to'];


function App() {
  const [generalFontSize, setGeneralFontSize] = useState(18);
  const [color] = useState(getRandomColor());
  const [character] = useState(getRandomCharacter());
  const [quote, setQuote] = useState('');
  const [characterTopMargin, setCharacterTopMargin] = useState(0);

  useEffect(() => {
    if (character) {
      setQuote(getRandomQuote(character));
    }
  }, [character]);

  const Svg = characters[character]?.svg;

  // resize text accordingly
  useEffect(() => {
    setTimeout(async () => { // css takes time to align itself
      const canvas = document.getElementById('canvas');
      if (canvas) {
        const canvasHeight = canvas.getBoundingClientRect().height;
      
        const characterHeight = document.getElementById('character').getBoundingClientRect().height;
        console.log(characterHeight);
        setCharacterTopMargin(canvasHeight - characterHeight);

        const words = document.querySelectorAll('.quote-word');
  
        let lastWordRect = words[words.length - 1].getBoundingClientRect();
        if (canvasHeight - lastWordRect.y > 30) {
          console.log('setting new font size');
          setGeneralFontSize(generalFontSize + 4);
        } else { // this means it finished adjusting font size
          console.log('adjusting individual words');

          const removeGaps = async () => {
            let previousWordRect;
            words.forEach(word => {
              const rect = word.getBoundingClientRect();
              if (previousWordRect) {
                if ((rect.top - previousWordRect.top) > generalFontSize) { // that means there's a gap
                  word.style.fontSize = (parseFloat(word.style.fontSize) - 10) + 'px';
                }
              }
              previousWordRect = rect;
            });
            const amountOfRows = countRows() + 1;
            lastWordRect = words[words.length - 1].getBoundingClientRect();

            // check if there are still gaps
            if (lastWordRect.bottom > (amountOfRows * generalFontSize) + 30) {
              console.log('need to remove rows again');
              removeGaps();
            }
          }

          const countRows = () => {
            let counter = 0;
            let prevRect;
            words.forEach(word => {
              const rect = word.getBoundingClientRect();
              if (prevRect) {
                if (rect.top !== prevRect.top) {
                  counter++;
                }
              }
              prevRect = rect;
            });

            return counter;
          }

          await removeGaps();
          
          // take care of quote outside of canvas
          lastWordRect = words[words.length - 1].getBoundingClientRect();
          while (lastWordRect.y > canvasHeight) {
            setGeneralFontSize(generalFontSize - 4);
            lastWordRect = words[words.length - 1].getBoundingClientRect();
          }
        }
      }
    }, 200);
  }, [generalFontSize]);

  const characterFloat = characters[character]?.float;
  const characterFloatingRight = characters[character]?.float === 'right';

  return (
    <div className="app">
      <div className="poster-wrapper" style={{ 
        backgroundColor: color
      }} id='canvas'>
        {Svg && <Svg id='character' style={{
          float: characterFloat,
          'shapeOutside': `url('/svgs/${character}.svg')`,
          marginTop: characterTopMargin + 'px',
          marginLeft: characterFloatingRight ? 'auto' : -30 + 'px',
          marginRight: characterFloatingRight ? -30 + 'px' : 'auto'
        }} />}
        {quote.split(' ').map((word, index) => {
          const fontSize = (smallWords.includes(word) ? generalFontSize * 0.7 : generalFontSize) + 'px';
          return <span className='quote-word' key={index} style={{ fontSize }}>{word} </span>
        })}
        <div className="overlay" style={{
          background: `linear-gradient(15deg, ${color}, transparent), url(https://grainy-gradients.vercel.app/noise.svg)`
        }}/>
      </div>
    </div>
  );
}

export default App;
