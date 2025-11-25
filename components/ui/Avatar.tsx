
import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.substring(0, 2).toUpperCase();
};

const nameToColor = (name: string) => {
    if (!name) return 'bg-slate-200 text-slate-800';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        'bg-red-200 text-red-800',
        'bg-yellow-200 text-yellow-800',
        'bg-green-200 text-green-800',
        'bg-blue-200 text-blue-800',
        'bg-indigo-200 text-indigo-800',
        'bg-purple-200 text-purple-800',
        'bg-pink-200 text-pink-800',
        'bg-teal-200 text-teal-800',
    ];
    return colors[Math.abs(hash % colors.length)];
};


const Avatar: React.FC<AvatarProps> = ({ name, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold ${sizeClasses[size]} ${nameToColor(name)}`}
    >
      <span>{getInitials(name)}</span>
    </div>
  );
};

export default Avatar;