import React from 'react';

const Avatar = ({ name }) => {
    const getInitials = (name) => {
        if (!name) return '?';
        const words = name.split(' ');
        if (words.length > 1) {
            return `${words[0][0]}${words[words.length - 1][0]}`;
        }
        return name.substring(0, 2);
    };

    return (
        <div className="w-10 h-10 rounded-full bg-[var(--brand-blue)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {getInitials(name)}
        </div>
    );
};

export default Avatar;