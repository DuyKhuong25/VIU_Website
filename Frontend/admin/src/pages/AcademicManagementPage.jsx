import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import ProgramLevelManager from '../components/academics/ProgramLevelManager';
import MajorManager from '../components/academics/MajorManager';

function AcademicManagementPage() {
    const [activeTab, setActiveTab] = useState('programs');
    const [refreshMajors, setRefreshMajors] = useState(false);

    const handleSwitchToPrograms = () => {
        setActiveTab('programs');
    };

    const handleProgramsUpdated = () => {
        setRefreshMajors(prev => !prev);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <GraduationCap size={36} className="text-[var(--brand-blue)]" />
                    <h1 className="text-[22px] font-bold text-[var(--brand-blue)] uppercase tracking-wider">
                        Quản lý Chương trình & Ngành học
                    </h1>
                </div>
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('programs')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-[13px] uppercase ${
                            activeTab === 'programs'
                                ? 'border-[var(--brand-blue)] text-[var(--brand-blue)]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Quản lý Chương trình Đào tạo
                    </button>
                    <button
                        onClick={() => setActiveTab('majors')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-[13px] uppercase ${
                            activeTab === 'majors'
                                ? 'border-[var(--brand-blue)] text-[var(--brand-blue)]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Quản lý Ngành Đào tạo
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'majors' &&
                    <MajorManager onSwitchToPrograms={handleSwitchToPrograms} key={refreshMajors}/>}
                {activeTab === 'programs' && <ProgramLevelManager onProgramsUpdated={handleProgramsUpdated}/>}
            </div>
        </div>
    );
}

export default AcademicManagementPage;