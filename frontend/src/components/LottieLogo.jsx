import React from 'react';
import Lottie from 'lottie-react';
import developerAnimation from '../assets/Developer.json';

const LottieLogo = ({ className = "w-10 h-10" }) => {
    return (
        <div className={className}>
            <Lottie 
                animationData={developerAnimation} 
                loop={true} 
                autoplay={true}
            />
        </div>
    );
};

export default LottieLogo;
