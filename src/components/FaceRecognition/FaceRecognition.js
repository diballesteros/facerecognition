import React from 'react';

const FaceRecognition = ({imageUrl}) => {
    return (
        <div>
            <img alt='' src={imageUrl} />
        </div>
    );
}

export default FaceRecognition;