import React from 'react';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa';
import * as Fa6Icons from 'react-icons/fa6';
import * as FiIcons from 'react-icons/fi';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io';
import * as Io5Icons from 'react-icons/io5';
import * as GoIcons from 'react-icons/go';
import * as BiIcons from 'react-icons/bi';
import * as BsIcons from 'react-icons/bs';
import * as AiIcons from 'react-icons/ai';
import * as RiIcons from 'react-icons/ri';
import * as TbIcons from 'react-icons/tb';

export default function LucideIcon({ name, size = 24, color, className, style, ...props }) {
  if (!name) return null;

  // 1. Try to match React Icons based on prefix
  let IconComponent = null;

  if (name.startsWith('Fa') && !name.startsWith('Faq')) {
    // Font Awesome 5 or 6
    IconComponent = FaIcons[name] || Fa6Icons[name];
  } else if (name.startsWith('Fi')) {
    IconComponent = FiIcons[name];
  } else if (name.startsWith('Md')) {
    IconComponent = MdIcons[name];
  } else if (name.startsWith('Io')) {
    IconComponent = IoIcons[name] || Io5Icons[name];
  } else if (name.startsWith('Go')) {
    IconComponent = GoIcons[name];
  } else if (name.startsWith('Bi')) {
    IconComponent = BiIcons[name];
  } else if (name.startsWith('Bs')) {
    IconComponent = BsIcons[name];
  } else if (name.startsWith('Ai')) {
    IconComponent = AiIcons[name];
  } else if (name.startsWith('Ri')) {
    IconComponent = RiIcons[name];
  } else if (name.startsWith('Tb')) {
    IconComponent = TbIcons[name];
  }

  // 2. Fallback to Lucide Icons
  if (!IconComponent) {
    let lucideName = name;
    if (typeof name === 'string') {
      // Normalize string to match Lucide exports (e.g. "graduation-cap" or "graduationCap" -> "GraduationCap")
      lucideName = name
        .replace(/-./g, match => match.charAt(1).toUpperCase()) // kebab to camel
        .replace(/^[a-z]/, match => match.toUpperCase()); // camel to Pascal
    }
    IconComponent = LucideIcons[lucideName];
  }

  // 3. Render icon or fallback to plain text/emoji
  if (!IconComponent) {
    return (
      <span className={className} style={{ fontSize: size, color, display: 'inline-block', lineHeight: 1, ...style }} {...props}>
        {name}
      </span>
    );
  }

  return <IconComponent size={size} color={color} className={className} style={style} {...props} />;
}
