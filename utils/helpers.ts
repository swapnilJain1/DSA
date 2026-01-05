export const formatTime = (s: number) => !s ? '0s' : s > 3600 ? `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m` : `${Math.floor(s/60)}m ${s%60}s`;

export const formatTimerDisplay = (s: number) => {
    if (!s) return '00:00';
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    const hours = Math.floor(mins / 60);
    if(hours > 0) return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeAgo = (iso: string | null) => { 
    if (!iso) return 'Not Attempted'; 
    const s = Math.floor((new Date().getTime() - new Date(iso).getTime()) / 1000); 
    return s > 86400 ? Math.floor(s/86400) + "d ago" : s > 3600 ? Math.floor(s/3600) + "h ago" : "Just now"; 
};

export const getDifficultyColor = (d: string) => d === 'Easy' ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200' : d === 'Medium' ? 'bg-amber-100/80 text-amber-800 border-amber-200' : 'bg-rose-100/80 text-rose-800 border-rose-200';

export const calculateEfficiency = (diff: string, time: number) => {
    if (!time) return null;
    const std: any = { 'Easy': 900, 'Medium': 1800, 'Hard': 2700 };
    const standard = std[diff] || 1800;
    const ratio = standard / time;
    let grade = 'Low', color = 'bg-orange-100 text-orange-700';
    if (ratio >= 1.5) { grade = 'Elite'; color = 'bg-purple-100 text-purple-700'; }
    else if (ratio >= 1.0) { grade = 'High'; color = 'bg-emerald-100 text-emerald-700'; }
    else if (ratio >= 0.7) { grade = 'Avg'; color = 'bg-blue-100 text-blue-700'; }
    return { grade, color, standard };
};

export const calculateNextReview = (currentInterval: number, grade: string) => {
    let nextInterval = 1;
    // Simple Spaced Repetition Logic
    if (grade === 'Low') {
        nextInterval = 1; // Review tomorrow
    } else if (grade === 'Avg') {
        nextInterval = currentInterval === 0 ? 3 : Math.ceil(currentInterval * 1.5);
    } else if (grade === 'High') {
        nextInterval = currentInterval === 0 ? 7 : Math.ceil(currentInterval * 2);
    } else if (grade === 'Elite') {
        nextInterval = currentInterval === 0 ? 14 : Math.ceil(currentInterval * 2.5);
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextInterval);
    return { nextDate: nextDate.toISOString(), interval: nextInterval };
};

export const parseUrlToTitle = (url: string) => { 
    try { 
        const p = new URL(url).pathname.split('/').filter(x=>x); 
        const i = p.indexOf('problems'); 
        return (i !== -1 && p[i+1]) ? p[i+1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null; 
    } catch { 
        return null; 
    } 
};

export const safeUUID = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2);