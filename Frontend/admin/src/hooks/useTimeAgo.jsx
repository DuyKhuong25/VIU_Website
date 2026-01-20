import { useState, useEffect } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';

const useTimeAgo = (dateInMs) => {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        if (!dateInMs) {
            setTimeAgo('');
            return;
        }

        const date = new Date(dateInMs);

        const update = () => {
            setTimeAgo(formatDistanceToNowStrict(date, { locale: vi, addSuffix: true }));
        };

        update();
        const intervalId = setInterval(update, 60000);

        return () => clearInterval(intervalId);
    }, [dateInMs]);

    return timeAgo;
};

export default useTimeAgo;