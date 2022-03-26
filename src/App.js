import './App.css';
import Quotes from './quotes.json';
import { ReactComponent as Rue } from './svgs/rue.svg';
import { ReactComponent as Cal } from './svgs/cal.svg';
import { ReactComponent as Nate } from './svgs/nate.svg';
import { ReactComponent as Cassie } from './svgs/cassie.svg';
import { ReactComponent as Maddy } from './svgs/maddy.svg';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  // rue[2], rue[14] - stuck
  const [generalFontSize, setGeneralFontSize] = useState(18);
  const [color] = useState(getRandomColor());
  const [character] = useState(getRandomCharacter());
  // const [character] = useState('rue'); // Test problamatic quote
  const [quote, setQuote] = useState('');
  const [characterTopMargin, setCharacterTopMargin] = useState(0);
  const [quoteOutOfCanvas, setQuoteOutOfCanvas] = useState(false);  
  const wordRefs = useRef([]);
  
  useEffect(() => {
    if (character) {
      setQuote(getRandomQuote(character)); 
    // setQuote(Quotes[character][8]) // Test problamatic quote
    }
  }, [character]);
  
  const Svg = characters[character]?.svg;

  const getLastWordRect = () => {
    if (wordRefs.current.length) {
      return wordRefs.current[wordRefs.current.length - 1].getBoundingClientRect();
    }
  };

  const removeGaps = useCallback(async () => {
    console.log('trying to remove gaps');
    let previousWordRect;
    wordRefs.current.forEach(word => {
      console.log('going over ', word.innerHTML);
      const rect = word.getBoundingClientRect();
      console.log('rect:', rect);
      if (previousWordRect) {
        if ((rect.top - previousWordRect.top) > generalFontSize) { // that means there's a gap
          word.style.fontSize = (parseFloat(word.style.fontSize) - 10) + 'px';
        }
      }
      previousWordRect = rect;
    });
    const amountOfRows = countRows() + 1;

    console.log('checking if need to remove gaps');
    // check if there are still gaps
    if (getLastWordRect().bottom > (amountOfRows * generalFontSize) + 30) {
      removeGaps();
    }

    return;
  }, [wordRefs, generalFontSize]);

  const countRows = () => {
    let counter = 0;
    let prevRect;
    wordRefs.current.forEach(word => {
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

  // resize text accordingly
  useEffect(() => {
    setTimeout(async () => { // css takes time to align itself
      const canvas = document.getElementById('canvas');
      if (canvas) {
        const canvasHeight = canvas.getBoundingClientRect().height;
        const characterHeight = document.getElementById('character').getBoundingClientRect().height;
        setCharacterTopMargin(canvasHeight - characterHeight);
  
        console.log('lastWordRect.y:', getLastWordRect().y);
        if (canvasHeight - getLastWordRect().y > 30 && !quoteOutOfCanvas) {
          console.log('enlarging');
          setGeneralFontSize((oldFontSize) => oldFontSize + 4);
        } else { // this means it finished adjusting font size
          console.log('finished enlarging');
          // take care of quote outside of canvas
          // console.log('INSIDE -- canvasHeight:', canvasHeight, 'lastWordRect.y:', getLastWordRect().y);
          await removeGaps();
          console.log('finished remove gaps');
          if (canvasHeight < getLastWordRect().y) {
            console.log('smaller font size');
            setQuoteOutOfCanvas(true);
            setGeneralFontSize((oldFontSize) => oldFontSize - 4);
          } 
        }
      }
    }, 200);
  }, [removeGaps, quoteOutOfCanvas]);

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
          return (
            <span 
              className='quote-word' 
              key={index} 
              style={{ fontSize }}
              ref={(ref) => wordRefs.current.splice(index, 1, ref)}>
              {word + " "}
            </span>
          )
        })}
        <div className="overlay" style={{
          background: `linear-gradient(15deg, ${color}, transparent), url(https://grainy-gradients.vercel.app/noise.svg)`
        }}/>
      </div>
    </div>
  );
}

export default App;
