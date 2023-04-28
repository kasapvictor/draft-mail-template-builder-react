import {useStore, useStoreMap} from "effector-react";
import {
  $elements,
  $hoveredElementRef,
  $selectedElement,
  $selectedElementRef,
  $tree,
  hoverElementRef,
  resetElementId, selectElementRef,
  setElementId
} from "./store.js";
import {createElement, memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";

const selfCloseElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);
const specialTypes = new Set([
  'canvas',
  'container',
  'table',
  'tbody',
  'tr',
  'td',
  'block',
  'row',
  'section',
]);
const contentEditable = new Set([
  'title', 'text','link', 'button'
]);


const mainColor = '#007BFF';

const useElementHandlers = ({type, isSelected, isSpecialType}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();

    if (type === 'canvas') {
      resetElementId()
    }

    if (!isSelected && !isSpecialType) {
      selectElementRef(event.currentTarget)
      setElementId({id: event.currentTarget.id});
    }
  }, [type, isSelected, isSpecialType]);

  const handleMouseEnter = useCallback((event) => {
    if (!isSelected && !isSpecialType) {
      event.stopPropagation();
      // console.log(event.target.getBoundingClientRect());
      hoverElementRef(event.currentTarget)
      setIsHovered(true);
    }
  }, [isSelected, isSpecialType]);

  const handleMouseLeave = useCallback((event) => {
    if (!isSpecialType) {
      event.stopPropagation();
      hoverElementRef(null);
      setIsHovered(false);
    }
  }, [isSpecialType]);

  return { isHovered, handleClick, handleMouseEnter, handleMouseLeave }
}

const RenderElement = memo(({ elementId, children }) => {
  const { tag, type, content, props } = useStoreMap({
    store: $elements,
    keys: [elementId],
    fn: (elements, [id]) => elements[id]
  });

  const isSelfCloseElement = tag ? selfCloseElements.has(tag.toLowerCase()) : false;
  const isSpecialType = type ? specialTypes.has(type.toLocaleString()) : false;
  const isContentEditable = contentEditable.has(type);

  // memorized store
  const isSelected = useStoreMap({
    store: $selectedElement,
    keys: [elementId],
    fn: (selectedElement, [id]) => selectedElement === id,
  });
  const refElement = useRef(null);
  const { isHovered, handleClick, handleMouseEnter, handleMouseLeave } = useElementHandlers({type, isSelected, isSpecialType})

  const isEmptyContent = isContentEditable && !content.length;
  const isFontSizeZero = isContentEditable && props?.style?.fontSize === '0px';
  const emptyStyles = isEmptyContent || isFontSizeZero
    ? {
      minHeight: '20px',
      outlineWidth: `1px ${mainColor} dashed`,
    }
    : {};

  const { style, ...otherProps } = props;
  const elementStyles = {
    ...style,
    cursor: 'default',
    outlineOffset: '-1px',
    position: isSelected || isHovered  ? "relative" : "static",
    outlineWidth: isSelected || isHovered ? '1px' : '0px',
    outlineColor: isSelected || isHovered ? mainColor : 'none',
    outlineStyle: isEmptyContent ? 'dashed' : 'solid',
    ...emptyStyles,
  }

  return (
    <>
      {
        createElement(
          tag,
          {
            ...otherProps,
            ref: refElement,
            id: elementId,
            key: elementId,
            'data-type': type,
            onClick: handleClick,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            style: {...elementStyles}
          },
          isSelfCloseElement
            ? null
            : <>
              {content}
              {children}
            </>
        )
      }
    </>
  )
});

const RenderTree = ({ tree }) => {
  return tree.children.map((node) => {

    return <RenderElement
      key={node.id}
      elementId={node.id}
      children={node.children && <RenderTree tree={node}/>}
    />
  });
}

export const RenderTemplate = () => {
  const tree = useStore($tree);

  return (
    <>
      <RenderTree tree={tree}/>
      <ElementLabel/>
    </>
  )
}

// LABEl
const labelStyle = {
  position: "absolute",
  backgroundColor: "#007BFF",
  color: '#FFFFFF',
  fontWeight: 400,
  padding: "2px 4px",
  fontSize: "12px",
  zIndex: 1000,
};

const useLabelElementPosition = (element) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (element) {

      const updatePosition = () => {
        const rect = element.getBoundingClientRect();
        const top = rect.top + window.scrollY - 22;
        const left = rect.left + window.scrollX;
        setPosition({ top, left });
      };

      const resizeObserver = new ResizeObserver(() => {
        updatePosition();
      });

      const mutationObserver = new MutationObserver(() => {
        updatePosition();
      });

      resizeObserver.observe(element);
      mutationObserver.observe(element, { attributes: true, childList: true, subtree: true });

      updatePosition();

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };

    } else {
      setPosition(null);
    }
  }, [element]);

  return position;
}

const ElementLabelSelected = () => {
  const target = useStore($selectedElementRef);
  const position = useLabelElementPosition(target);

  return target && createPortal(
    <div style={{ ...labelStyle, ...position }}>{target.dataset.type}</div>,
    document.body
  );
};

const ElementLabelHovered = () => {
  const target = useStore($hoveredElementRef);
  const position = useLabelElementPosition(target);


  return target && createPortal(
    <div style={{ ...labelStyle, ...position }}>{target.dataset.type}</div>,
    document.body
  );
};

const ElementLabel = () => {
  return (
    <>
      <ElementLabelSelected />
      <ElementLabelHovered />
    </>
  )
}

