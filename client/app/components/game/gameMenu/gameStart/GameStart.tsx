import './GameStart.css'
import React from 'react';

const MatchMaking: React.FC = () => {
    return (
        <div className="matchmakingClass">
            <div className="cs-loader">
                <div className="cs-loader-inner">
                    <label>P</label>
                    <label>O</label>
                    <label>N</label>
                    <label>G</label>
                    <label>!</label>
                    <label>!</label>
                </div>
            </div>
        </div>
    );
};
export default MatchMaking