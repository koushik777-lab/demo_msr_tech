import React, { useRef, useState } from 'react';

/**
 * EditableText — renders text that becomes contentEditable on click.
 * Props:
 *   tag     — 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'a' | 'div' (default 'span')
 *   value   — the text to display
 *   onSave  — callback(newText) fired on blur
 *   style   — inline styles passed through
 *   className — class passed through
 */
export default function EditableText({ tag: Tag = 'span', value, onSave, style, className, ...rest }) {
  const ref = useRef(null);
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setEditing(true);
    // Focus after render (native click will place caret at click location)
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
      }
    }, 0);
  };

  const handleBlur = () => {
    setEditing(false);
    const newText = ref.current?.innerText?.trim() || '';
    if (newText !== value && onSave) {
      onSave(newText);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && Tag !== 'p' && Tag !== 'div') {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === 'Escape') {
      ref.current.innerText = value;
      ref.current?.blur();
    }
  };

  return (
    <Tag
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...style,
        outline: 'none',
        cursor: editing ? 'text' : 'pointer',
        borderBottom: editing 
          ? '2px solid #00FFD1' 
          : (hovered ? '2px dashed rgba(0, 255, 209, 0.5)' : '2px solid transparent'),
        transition: 'all 0.15s ease',
        minWidth: 20,
      }}
      className={className}
      {...rest}
    >
      {value}
    </Tag>
  );
}
