import {memo, useEffect} from "react";
import {useStore, useStoreMap} from "effector-react";

import {
  $canvasActive,
  $elements,
  $selectedElement,
  handleBackgroundColor,
  handleContainerWidth,
  handleContent,
  handleFontSize,
  handlePadding,
  handleTextColor
} from "./store.js";

import {$width, widthChanged} from "../models/model-width.js";
import {WIDTH} from "../constants.js";

const contentEditable = new Set([
  'title', 'text','link', 'button'
]);

const settingsRowStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'start',
  alignItems: 'flex-start',
  gap: 4
}

const useSelectedElement = (selectedElementId) => {
  return useStoreMap({
    store: $elements,
    keys: [selectedElementId],
    fn: (elements, [id]) => elements[id] || null,
  });
};

// PADDING
const Padding = memo(({element}) => {
  if (!element) {
    return null;
  }


  const paddingTop = element.props?.style.paddingTop || '0px';
  const paddingRight = element.props?.style.paddingRight || '0px';
  const paddingBottom = element.props?.style.paddingBottom || '0px';
  const paddingLeft = element.props?.style.paddingLeft || '0px';


  return (
    <>
      <div style={settingsRowStyles}>
        <label htmlFor={`${element.id}-padding-top`} style={{textTransform: 'capitalize'}}>Padding Top:</label>
        <input
          min={0}
          type="number"
          value={paddingTop.replace('px', '')}
          id={`${element.id}-padding-top`}
          onChange={(e) => handlePadding({
            elementId: element.id,
            value: e.target.value,
            side: 'paddingTop',
          })}/>
      </div>
      <div style={settingsRowStyles}>
        <label htmlFor={`${element.id}-padding-right`} style={{textTransform: 'capitalize'}}>Padding Right:</label>
        <input
          min={0}
          type="number"
          value={paddingRight.replace('px', '')}
          id={`${element.id}-padding-right`}
          onChange={(e) => handlePadding({
            elementId: element.id,
            value: e.target.value,
            side: 'paddingRight',
          })}/>
      </div>
      <div style={settingsRowStyles}>
        <label htmlFor={`${element.id}-padding-bottom`} style={{textTransform: 'capitalize'}}>Padding Botom:</label>
        <input
          min={0}
          type="number"
          value={paddingBottom.replace('px', '')}
          id={`${element.id}-padding-bottom`}
          onChange={(e) => handlePadding({
            elementId: element.id,
            value: e.target.value,
            side: 'paddingBottom',
          })}/>
      </div>
      <div style={settingsRowStyles}>
        <label htmlFor={`${element.id}-padding-left`} style={{textTransform: 'capitalize'}}>Padding Left:</label>
        <input
          min={0}
          type="number"
          value={paddingLeft.replace('px', '')}
          id={`${element.id}-padding-left`}
          onChange={(e) => handlePadding({
            elementId: element.id,
            value: e.target.value,
            side: 'paddingLeft',
          })}/>
      </div>
    </>
  )
});

// FONT SIZE
const FontSize = memo(({element}) => {
  if (!element || !contentEditable.has(element.type)) {
    return null;
  }

  const fontSize = element.props?.style.fontSize || '16px';
  const fontSizeFormatted =  typeof fontSize === 'string' ? fontSize.replace('px', '') : fontSize;

  return (
    <div style={settingsRowStyles}>
      <label htmlFor={`${element.id}-font-size`} style={{textTransform: 'capitalize'}}>Font Size:</label>
      <input
        type="number"
        value={fontSizeFormatted}
        id={`${element.id}-font-size`}
        onChange={(e) => handleFontSize({
          elementId: element.id,
          value: e.target.value,
        })}/>
    </div>
  )
});

// BACKGROUND COLOR
const BackgroundColor = memo(({element}) => {
  if (!element) {
    return null;
  }

  const color = element.props?.style.backgroundColor || ''; // transparent

  return (
    <div style={settingsRowStyles}>
      <label htmlFor={`${element.id}-background-color`} style={{textTransform: 'capitalize'}}>Background Color:</label>
      <input
        type="color"
        value={color}
        id={`${element.id}-background-color`}
        onChange={(e) => handleBackgroundColor({
          elementId: element.id,
          value: e.target.value,
        })}/>

      <button onClick={(e) => handleBackgroundColor({
        elementId: element.id,
        value: '', // transparent
      })}>Clear background</button>

    </div>
  )
});

// TEXT COLOR
const TextColor = memo(({element}) => {
  if (!element || !contentEditable.has(element.type)) {
    return null;
  }

  const color = element.props?.style.color || '#333333';

  return (
    <div style={settingsRowStyles}>
      <label htmlFor={`${element.id}-color`} style={{textTransform: 'capitalize'}}>Text Color:</label>
      <input
        type="color"
        value={color}
        id={`${element.id}-color`}
        onChange={(e) => handleTextColor({
          elementId: element.id,
          value: e.target.value,
        })}/>
    </div>
  )
});

// CONTENT
const Content = memo(({element}) => {
  if (!element || !contentEditable.has(element.type)) {
    return null;
  }

  return (
    <div style={settingsRowStyles}>
      <label htmlFor={`${element.id}-content`} style={{textTransform: 'capitalize'}}>Content:</label>
      <input
        type="text"
        value={element.content}
        id={`${element.id}-content`}
        onChange={(e) => handleContent({
          elementId: element.id,
          value: e.target.value,
        })}/>
    </div>
  )
})

const Width = () => {
  const width = useStore($width);

  return (
    <div>
      <h4 style={{lineHeight: 2, margin: 0}}>Width: {width}</h4>
      <div style={{display: 'flex', gap: 10}}>
        <button onClick={() => {
          widthChanged(WIDTH.LG)
          handleContainerWidth(WIDTH.LG)
        }}>
          {width === WIDTH.LG ? <strong>{WIDTH.LG}</strong> : WIDTH.LG}
        </button>
        <button onClick={() => {
          widthChanged(WIDTH.SM);
          handleContainerWidth(WIDTH.SM);
        }}>
          {width === WIDTH.SM ? <strong>{WIDTH.SM}</strong> : WIDTH.SM}
        </button>
      </div>
    </div>
  )
}

const CanvasSettings = memo(() => {
  const isSelectedCanvas = useStore($canvasActive);

  const elements = useStore($elements);
  const canvas = elements.canvas;

  return !isSelectedCanvas ? null : (
    <div>
      <h4>Canvas settings</h4>

      <div style={settingsRowStyles}>
        <label htmlFor={`${canvas.id}-background-color`} style={{textTransform: 'capitalize'}}>Background Color:</label>
        <input
          type="color"
          value={canvas.props.style.backgroundColor}
          id={`${canvas.id}-background-color`}
          onChange={(e) => handleBackgroundColor({
            elementId: canvas.id,
            value: e.target.value,
          })}/>

        <button onClick={(e) => handleBackgroundColor({
          elementId: canvas.id,
          value: '', // transparent
        })}>Clear background</button>

      </div>
    </div>
  )
})

export const SettingsPanel = () => {
  const selectedElementId = useStore($selectedElement);
  const element = useSelectedElement(selectedElementId);

  console.log('SETTINGS ELEMENT', element);

  return (
    <div className="setting-panel">
      <h3 style={{padding: 0, margin: 0, textTransform: 'capitalize'}}>
        Settings {element ? `:: ${element.type}` : null}
      </h3>

      <Width/>
      <CanvasSettings/>
      <Content element={element} />
      <FontSize element={element}/>
      <TextColor element={element} />
      <BackgroundColor element={element} />
      <Padding element={element}/>
    </div>
  )
}


// TODO
//  + 1) переключение экранов с 600 на 300
//  2) добавить смену позиции секций
//  3) создать структуру реального шаблона
//  4) сделать выгрузку в шаблона в html для тестов
//  5) при клике на canvas должны открываться настройки всего шаблона
