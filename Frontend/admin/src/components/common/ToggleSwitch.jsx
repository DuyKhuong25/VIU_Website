import React from 'react';

function ToggleSwitch({ checked, onChange, disabled}) {
    // console.log(checked);
    return (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex items-center h-[18px] rounded-full w-[35px] transition-colors duration-200 ease-in-out focus:outline-none ${
                disabled ? 'cursor-not-allowed opacity-50' : ''
            } ${checked ? 'bg-green-700' : 'bg-gray-200'}`}
        >
        <span className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-1'
        }`}/>
        </button>
    );
}

export default ToggleSwitch;