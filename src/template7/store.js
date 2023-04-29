import {createStore, createApi, createEffect, createEvent} from "effector";

import { tree, elements} from './mock.js'
import produce from "immer";

export const $tree = createStore(tree);

export const $elements = createStore(elements);

export const $selectedElement = createStore(null);

export const { setElementId, resetElementId } = createApi($selectedElement,{
  setElementId: (state, payload) => {
    return payload.id;
  },
  resetElementId: () => {
    return null;
  },
});

export const {handleContainerWidth, handleContent, handleTextColor , handleBackgroundColor, handleFontSize, handlePadding} = createApi($elements, {
  handleContainerWidth: (state, payload) => {
    return produce(state, (draft) => {
      draft.container.props.style.maxWidth = payload; // FIXME сбросить размер (600) при сохранении/выгрузке в html
    });
  },
  handleContent: (state, payload) => {
    const {elementId, value} = payload;

    return produce(state, (draft) => {
      draft[elementId].content = value;
    });
  },
  handleTextColor: (state, payload) => {
    const {elementId, value} = payload;

    return produce(state, (draft) => {
      draft[elementId].props.style.color = value;
    });
  },
  handleBackgroundColor: (state, payload) => {
    const {elementId, value} = payload;

    return produce(state, (draft) => {
      draft[elementId].props.style.backgroundColor = value;
    });
  },
  handleFontSize: (state, payload) => {
    const {elementId, value} = payload;

    return produce(state, (draft) => {
      draft[elementId].props.style.fontSize = `${value}px`;
    });
  },
  handlePadding: (state, payload) => {
    const {elementId, value, side} = payload;

    return produce(state, (draft) => {

      draft[elementId].props.style[side] = `${value}px`;
    });
  }
});

$selectedElement.watch((id) => {
  console.log('SELECTED ELEMENT ID::', id);
});

// CANVAS COMMON SETTINGS
export const $canvasActive = createStore(false);
export const selectedCanvas = createEvent('selected-canvas');

$canvasActive.on(selectedCanvas, (state, value) => {
  if (state === value) {
    return state;
  }

  console.log('->', value)

  return value;
});

// TO SHOW LABEL
export const $hoveredElementRef = createStore(null);
export const $selectedElementRef = createStore(null);
export const selectedElementRef = createEvent('select-element');
export const hoveredElementRef = createEvent('hover-element');

$selectedElementRef.on(selectedElementRef, (_, element) => {
  return element
});

$hoveredElementRef.on(hoveredElementRef, (_, element) => {
  return element
});
